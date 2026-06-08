const { validationResult } = require('express-validator');
const orgsService = require('../services/organisations.service');

const getOrganisations = async (req, res, next) => {
  try {
    const organisations = await orgsService.getOrganisations(req.user.id, req.user.role);
    res.json({ success: true, organisations });
  } catch (err) { next(err); }
};

const createOrganisation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const organisation = await orgsService.createOrganisation(req.body);
    res.status(201).json({ success: true, organisation });
  } catch (err) { next(err); }
};

const updateOrganisation = async (req, res, next) => {
  try {
    const organisation = await orgsService.updateOrganisation(req.params.id, req.body);
    res.json({ success: true, organisation });
  } catch (err) { next(err); }
};

module.exports = { getOrganisations, createOrganisation, updateOrganisation };
