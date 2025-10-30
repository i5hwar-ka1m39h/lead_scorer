import express from "express";
import { 
  createOffer, 
  getCSVResult, 
  getOfferResult, 
  getScoreForOffer, 
  uploadCSV 
} from "../controllers/allControllers.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "upload/" });

/**
 * @openapi
 * /v1/offer:
 *   post:
 *     summary: Create a new offer
 *     description: Creates a new offer with name, value propositions, and ideal use cases.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - value_props
 *               - ideal_use_cases
 *             properties:
 *               name:
 *                 type: string
 *                 example: Email marketing automation
 *               value_props:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["24/7 outreach", "6x more meetings", "10x client retention"]
 *               ideal_use_cases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["B2B SaaS mid-market"]
 *     responses:
 *       201:
 *         description: Offer created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: offer created successfully.
 *               offer:
 *                 id: "5cb03833-eac0-4d13-902a-da31ab0e784e"
 *                 name: Email marketing automation
 *                 value_prop: ["24/7 outreach", "6x more meetings", "10x client retention"]
 *                 ideal_use_cases: ["B2B SaaS mid-market"]
 */
router.post("/offer", createOffer);


/**
 * @openapi
 * /v1/leads/upload:
 *   post:
 *     summary: Upload leads via CSV file
 *     description: Uploads a CSV file containing leads with headers like name, role, company, industry, location, and linkedin_bio.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CSV uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               message: csv uploaded successfully.
 *               leadCount: 10
 */
router.post("/leads/upload", upload.single("file"), uploadCSV);


/**
 * @openapi
 * /v1/score/{offerId}:
 *   get:
 *     summary: Generate lead scores for a given offer
 *     description: Calculates AI-based and rule-based scores for all leads associated with the given offer ID.
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 5cb03833-eac0-4d13-902a-da31ab0e784e
 *     responses:
 *       201:
 *         description: Scores generated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: score generated for given offer id.
 *               scoreCount: 10
 *       503:
 *         description: Model overloaded
 *         content:
 *           application/json:
 *             example:
 *               message: AI model overloaded. Please try again later.
 *               provider: Gemini
 *               error:
 *                 status: 503
 *                 code: 503
 */
router.get("/score/:offerId", getScoreForOffer);


/**
 * @openapi
 * /v1/results/{offerId}:
 *   get:
 *     summary: Get formatted lead scores for an offer
 *     description: Returns lead details with their intent, reasoning, and total score for a given offer ID.
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 5cb03833-eac0-4d13-902a-da31ab0e784e
 *     responses:
 *       200:
 *         description: Successfully fetched results
 *         content:
 *           application/json:
 *             example:
 *               message: score for offer :5cb03833-eac0-4d13-902a-da31ab0e784e
 *               formattedScore:
 *                 - name: Alice Johnson
 *                   role: Marketing Manager
 *                   company: TechNova Solutions
 *                   intent: HIGH
 *                   score: 80
 *                   reasoning: >
 *                     The lead's role as Marketing Manager at a Software company (SaaS)
 *                     and her experience in SaaS marketing and customer acquisition perfectly
 *                     align with the 'Email marketing automation' offer.
 */
router.get("/results/:offerId", getOfferResult);


/**
 * @openapi
 * /v1/res_csv/{offerId}:
 *   get:
 *     summary: Download lead score results as CSV
 *     description: Returns the formatted lead results for an offer as a downloadable CSV file.
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 5cb03833-eac0-4d13-902a-da31ab0e784e
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *         content:
 *           text/csv:
 *             example: |
 *               "name","role","company","intent","score","reasoning"
 *               "Alice Johnson","Marketing Manager","TechNova Solutions","HIGH",80,"The lead's role as Marketing Manager..."
 */
router.get("/res_csv/:offerId", getCSVResult);

export default router;
