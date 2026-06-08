const slaService = require('../services/sla.service');

const getSLAConfigs = async (req, res, next) => {
  try {
    const configs = await slaService.getSLAConfigs();
    res.json({ success: true, configs });
  } catch (err) { next(err); }
};

const updateSLAConfig = async (req, res, next) => {
  try {
    const config = await slaService.updateSLAConfig(req.params.id, req.body, req.user.id);
    res.json({ success: true, config });
  } catch (err) { next(err); }
};

module.exports = { getSLAConfigs, updateSLAConfig };
