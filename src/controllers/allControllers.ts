import express, { type Request, type Response } from "express";
import fs from "fs";
import dotenv from "dotenv";
import prisma from "../lib/prisma.js";
import multer from "multer";
import csv from "csv-parser";
import {
  dataCompletenessScore,
  getIndustryScore,
  getRoleScore,
  type Lead,
} from "../lib/scorer.js";
import { getAiScore } from "../lib/aiScorer.js";
import { Intent } from "../generated/prisma/enums.js"; 
import { Prisma } from "../generated/prisma/client.js";
import { Parser } from "json2csv";
type ScoreWithLead = Prisma.ScoreGetPayload<{ include: { Lead: true } }>;

export const createOffer = async (req:Request, res:Response) => {
  const { name, value_props, ideal_use_cases } = req.body;
  try {
    if (name == "" || value_props.length == 0 || ideal_use_cases.length == 0) {
      return res.status(400).json({ message: "bad request" });
    }
    const offer = await prisma.offer.create({
      data: {
        name: name,
        value_prop: value_props,
        ideal_use_cases: ideal_use_cases,
      },
    });

    if (!offer) {
      return res.status(500).json({ message: "error creating offer." });
    }

    res.status(201).json({ message: "offer created successfully.", offer });
  } catch (error: any) {
    console.error("error:", error);
    res.status(500).json({ message: "something went bad." });
  }
}

export const uploadCSV =  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "bad request." });
      }

      const result: Lead[] = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {
          result.push({
            name: data.name,
            role: data.role,
            company: data.company,
            industry: data.industry,
            location: data.location,
            linkedIn_bio: data.linkedIn_bio,
          });
        })
        .on("end", async () => {
          await prisma.lead.createMany({
            data: result,
            skipDuplicates: true,
          });

          fs.unlinkSync(req.file!.path);

          res.status(201).json({
            message: "csv uploaded successfully.",
            leadCount: result.length,
          });
        });
    } catch (error) {
      console.error("error:", error);
      res.status(500).json({ message: "something went bad." });
    }
  }

export const getScoreForOffer = async (req: Request, res: Response) => {
  const offerId = req.params.offerId;
  try {
    const offer = await prisma.offer.findUnique({
      where: {
        id: offerId as string,
      },
    });

    if(!offer){
      return res.status(404).json({message:"offer with given id not found."})
    }

    console.log(offer);
    
    const leads = await prisma.lead.findMany();

    console.log(leads.length);
    if(leads.length == 0 ){
      return res.status(404).json({message:"no lead found"});
    }
   
    let createdCount = 0;
    let skippedCount = 0

    for (const lead of leads) {

      const existing = await prisma.score.findUnique({
        where: {
          leadId_offerId: { leadId: lead.id, offerId: offer.id },
        },
      });

      if (existing) {
        console.log(`Skipping duplicate score for Lead: ${lead.name}`);
        skippedCount++;
        continue; // skip this lead
      }
      const roleScore = getRoleScore(lead.role);
      const industryScore = getIndustryScore(lead.industry, offer!.value_prop);
      const dataScore = dataCompletenessScore(lead);

      const ruleScore = roleScore + industryScore + dataScore;

      const aiResp = await getAiScore(offer!, lead);
      
      const aiScore = aiResp.score;

      const reasoning = aiResp.reasoning;

      await prisma.score.create({
        data: {
          leadId: lead.id,
          offerId: offer!.id,
          role_score: roleScore,
          industry_score: industryScore,
          data_completeness_score: dataScore,
          rule_score: ruleScore,
          ai_score: aiScore,
          intent: Intent[aiResp.intent as keyof typeof Intent],
          reasoning: reasoning,
        },
      });
      createdCount++;
    }

    res.status(201).json({
      message: "score generated for given offer id.",
      scoreCount: leads.length,
    });
  } catch (error:any) {
    console.error("error:", error);
     if (error.name === "ApiError" && error.status === 503) {
    return res.status(503).json({
      message: "AI model overloaded. Please try again later.",
      provider: "Gemini",
      error: {
        status: error.status,
        code: 503,
      },
    });
  }
    res.status(500).json({ message: "something went bad.", error});
  }
}

export const getOfferResult = async (req: Request, res: Response) => {
  const offerId = req.params.offerId;
  try {
    const scores = await prisma.score.findMany({
      where: {
        offerId: offerId as string,
      },
      include: { Lead: true },
    });

    const formattedScore =
      scores.map((each: ScoreWithLead) => ({
        name: each.Lead.name,
        role: each.Lead.role,
        company: each.Lead.company,
        intent: each.intent,
        score: each.rule_score + each.ai_score,
        reasoning: each.reasoning,
      })) ?? [];

    res
      .status(200)
      .json({ message: `score for offer :${offerId}`, formattedScore });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({ message: "something went bad." });
  }
}

export const getCSVResult = async (req: Request, res: Response) => {
  const offerId = req.params.offerId;
  try {
    const scores = await prisma.score.findMany({
      where: {
        offerId: offerId as string,
      },
      include: { Lead: true },
    });

    const formattedScore =
      scores.map((each: ScoreWithLead) => ({
        name: each.Lead.name,
        role: each.Lead.role,
        company: each.Lead.company,
        intent: each.intent,
        score: each.rule_score + each.ai_score,
        reasoning: each.reasoning,
      })) ?? [];

    const parser = new Parser();
    const csv = parser.parse(formattedScore);

    res.header("Content-Type", "text/csv");
    res.attachment(`offer_${offerId}_results.csv`);
    res.send(csv);
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({ message: "something went bad." });
  }
}