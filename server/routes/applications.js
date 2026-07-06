import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all applications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM applications 
      ORDER BY created_at DESC
    `);
    
    // Transform snake_case to camelCase for frontend
    const applications = result.rows.map(row => ({
      id: row.app_id,
      status: row.status,
      date: row.date,
      carrier: row.carrier,
      plan: row.plan_type,
      planType: row.plan_type,
      premium: row.monthly_premium,
      monthlyPremium: row.monthly_premium,
      faceAmount: row.face_amount,
      willingToAccept: row.willing_to_accept,
      // Personal
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      address: row.address,
      phone: row.phone,
      city: row.city,
      state: row.state,
      zip: row.zip,
      stateOfBirth: row.state_of_birth,
      dob: row.dob,
      age: row.age,
      ssn: row.ssn,
      gender: row.gender,
      height: row.height,
      weight: row.weight,
      tobacco: row.tobacco,
      // Owner
      ownerName: row.owner_name,
      ownerRel: row.owner_rel,
      ownerSsn: row.owner_ssn,
      ownerAddress: row.owner_address,
      // Beneficiaries
      primaryBenName: row.primary_ben_name,
      primaryBenRel: row.primary_ben_rel,
      contingentBenName: row.contingent_ben_name,
      contingentBenRel: row.contingent_ben_rel,
      // Riders
      grandchildRider: row.grandchild_rider,
      grandchildCount: row.grandchild_count,
      grandchildUnits: row.grandchild_units,
      // Existing Insurance
      hasExisting: row.has_existing,
      willReplace: row.will_replace,
      // Physician
      physicianName: row.physician_name,
      // Health Questions
      q1: row.q1, q2: row.q2, q3: row.q3,
      q4: row.q4, q5: row.q5, q6: row.q6,
      q7a: row.q7a, q7b: row.q7b, q7c: row.q7c, q7d: row.q7d,
      q8a: row.q8a, q8b: row.q8b, q8c: row.q8c,
      // Banking
      accountName: row.account_name,
      accountType: row.account_type,
      bankName: row.bank_name,
      bankAddress: row.bank_address,
      routing: row.routing,
      accountNum: row.account_num,
      draftSchedule: row.draft_schedule,
      draftDate: row.draft_date,
      // Agent Dialer tracking
      annualPremium: row.annual_premium,
      lastCallDate: row.last_call_date,
      lastDisposition: row.last_disposition,
      callNotes: row.call_notes,
      // Meta
      riskScore: row.risk_score || 0,
      leadType: row.lead_type || 'application',
      // Automation
      carrierApplicationNumber: row.carrier_application_number,
      automationStatus: row.automation_status,
      automationError: row.automation_error,
      automationCompletedAt: row.automation_completed_at
    }));
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST new application
router.post('/', async (req, res) => {
  const data = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO applications (
        app_id, status, date, carrier, plan_type, monthly_premium, face_amount, willing_to_accept,
        first_name, middle_name, last_name, address, city, state, zip, state_of_birth,
        dob, age, ssn, gender, height, weight, tobacco, phone,
        owner_name, owner_rel, owner_ssn, owner_address,
        primary_ben_name, primary_ben_rel, contingent_ben_name, contingent_ben_rel,
        grandchild_rider, grandchild_count, grandchild_units,
        has_existing, will_replace, physician_name,
        q1, q2, q3, q4, q5, q6, q7a, q7b, q7c, q7d, q8a, q8b, q8c,
        account_name, account_type, bank_name, bank_address, routing, account_num,
        draft_schedule, draft_date, risk_score, lead_type,
        carrier_application_number, automation_status, automation_error, automation_completed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28,
        $29, $30, $31, $32,
        $33, $34, $35,
        $36, $37, $38,
        $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51,
        $52, $53, $54, $55, $56, $57,
        $58, $59, $60, $61,
        $62, $63, $64, $65
      ) RETURNING *
    `, [
      data.id || `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      data.status || 'Submitted', 
      data.date || new Date().toISOString().split('T')[0],
      data.carrier, data.planType, data.monthlyPremium || data.premium, data.faceAmount, data.willingToAccept || false,
      data.firstName, data.middleName, data.lastName, data.address, data.city, data.state, data.zip, data.stateOfBirth,
      data.dob || null, data.age || null, data.ssn, data.gender, data.height, data.weight, data.tobacco, data.phone,
      data.ownerName, data.ownerRel, data.ownerSsn, data.ownerAddress,
      data.primaryBenName, data.primaryBenRel, data.contingentBenName, data.contingentBenRel,
      data.grandchildRider || false, data.grandchildCount || 0, data.grandchildUnits || 0,
      data.hasExisting, data.willReplace, data.physicianName,
      data.q1, data.q2, data.q3, data.q4, data.q5, data.q6, data.q7a, data.q7b, data.q7c, data.q7d, data.q8a, data.q8b, data.q8c,
      data.accountName, data.accountType || 'checking', data.bankName, data.bankAddress, data.routing, data.accountNum,
      data.draftSchedule, data.draftDate, data.riskScore || Math.floor(Math.random() * 100), data.leadType || 'application',
      data.carrierApplicationNumber || data.applicationNumber || null,
      data.automationStatus || null,
      data.automationError || null,
      data.automationCompletedAt || null
    ]);
    
    res.status(201).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PUT update application
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    plan, 
    planType,
    premium, 
    carrier,
    annualPremium,
    lastCallDate,
    lastDisposition,
    callNotes,
    carrierApplicationNumber,
    applicationNumber,
    automationStatus,
    automationError,
    automationCompletedAt
  } = req.body;
  
  try {
    await pool.query(`
      UPDATE applications 
      SET status = COALESCE($1, status),
          plan_type = COALESCE($2, COALESCE($3, plan_type)),
          monthly_premium = COALESCE($4, monthly_premium),
          carrier = COALESCE($5, carrier),
          annual_premium = COALESCE($6, annual_premium),
          last_call_date = COALESCE($7, last_call_date),
          last_disposition = COALESCE($8, last_disposition),
          call_notes = COALESCE($9, call_notes),
          carrier_application_number = COALESCE($10, COALESCE($11, carrier_application_number)),
          automation_status = COALESCE($12, automation_status),
          automation_error = COALESCE($13, automation_error),
          automation_completed_at = COALESCE($14, automation_completed_at),
          updated_at = NOW()
      WHERE app_id = $15
    `, [
      status, plan, planType, premium, carrier, annualPremium, lastCallDate, lastDisposition, callNotes,
      carrierApplicationNumber, applicationNumber, automationStatus, automationError, automationCompletedAt,
      id
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE application
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM applications WHERE app_id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;
