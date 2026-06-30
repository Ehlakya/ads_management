const { Quotation, Ad, TheatreUser } = require('../models');

// @desc    Get all quotations with ad details
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res) => {
  try {
    // If it's a theatre user, we only want to show THEIR quotations for these ads
    const quotationFilter = req.user.role === 'theatre_user' ? { theatre_user_id: req.user.id } : {};

    const ads = await Ad.findAll({
      include: [{
        model: Quotation,
        required: false,
        where: quotationFilter
      }],
      order: [['created_at', 'DESC']]
    });

    const formattedData = ads.map(ad => {
      // Flatten data to match what the frontend expects
      const adJson = ad.toJSON();
      // An ad could have multiple quotes, but for this ledger we usually take the first one or map them.
      // Assuming a 1-to-1 for the ledger view in this specific query logic
      const quotation = adJson.Quotations && adJson.Quotations.length > 0 ? adJson.Quotations[0] : {};
      
      return {
        ad_id: adJson.id,
        ad_title: adJson.title || 'Untitled',
        ad_client: adJson.client || 'N/A',
        ad_budget: adJson.budget,
        ad_status: adJson.status,
        ad_impressions: adJson.impressions,
        video_url: adJson.video_url,
        id: quotation.id || null,
        amount: quotation.amount || null,
        status: quotation.status || null,
        theatre_message: quotation.theatre_message || null,
        admin_response: quotation.admin_response || null,
        admin_response_at: quotation.admin_response_at || null,
        admin_suggested_screen: quotation.admin_suggested_screen || null,
        theatre_screen_decision: quotation.theatre_screen_decision || 'pending',
        created_at: quotation.created_at || null,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Admin respond to theatre quotation request (Accept or Reject)
// @route   PUT /api/quotations/:id/respond
// @access  Private (Admin)
exports.respondToTheatreRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, suggestedScreen } = req.body; // 'accepted', 'rejected', or 'negotiate'

    if (!['accepted', 'rejected', 'negotiate'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Invalid response. Must be "accepted", "rejected", or "negotiate".' });
    }

    const quotation = await Quotation.findByPk(id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (response === 'negotiate') {
      if (!suggestedScreen) {
        return res.status(400).json({ success: false, message: 'Suggested screen is required for negotiation' });
      }
      quotation.admin_suggested_screen = suggestedScreen;
      quotation.theatre_screen_decision = 'pending';
      // status remains 'confirmed' (which means request is active)
    } else {
      quotation.admin_response = response;
      // If accepted/rejected normally, clear suggestions
      quotation.admin_suggested_screen = null;
      quotation.theatre_screen_decision = 'pending';
    }

    quotation.admin_response_at = new Date();
    await quotation.save();

    res.status(200).json({
      success: true,
      data: quotation,
      message: `Quotation ${response} successfully`,
    });
  } catch (error) {
    console.error('Error responding to theatre request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Create a quotation for an ad
// @route   POST /api/quotations
// @access  Private
exports.createQuotation = async (req, res) => {
  const { ad_id, amount, notes } = req.body;

  try {
    const quotation = await Quotation.create({
      ad_id,
      amount,
      notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: quotation,
      message: 'Quotation created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm a quotation or submit a new request by theatre user
// @route   POST /api/quotations/:id/confirm
// @access  Private (Theatre User)
exports.confirmQuotation = async (req, res) => {
  try {
    const { id } = req.params; // This could be quotation ID or Ad ID depending on frontend logic
    const theatreUserId = req.user?.role === 'theatre_user' ? req.user.id : req.body.theatreUserId;
    const { description, adId, selected_screens } = req.body;

    if (!theatreUserId) {
      return res.status(400).json({ success: false, message: 'Theatre user is required to confirm a quotation' });
    }

    let quotation;
    
    // 1. Try to find by Quotation ID
    if (id && id !== 'undefined' && id !== 'null') {
      const foundById = await Quotation.findByPk(id);
      // If it exists but belongs to someone else, don't use it
      if (foundById && foundById.theatre_user_id && foundById.theatre_user_id !== theatreUserId) {
        quotation = null;
      } else {
        quotation = foundById;
      }
    }

    // 2. If not found or belongs to someone else, find/create by adId and theatreUserId
    const targetAdId = adId || (quotation ? quotation.ad_id : id);
    
    if (!quotation && targetAdId) {
      quotation = await Quotation.findOne({
        where: {
          ad_id: targetAdId,
          theatre_user_id: theatreUserId
        }
      });
    }

    if (!quotation) {
      // 3. Create a new quotation if it doesn't exist
      quotation = await Quotation.create({
        ad_id: targetAdId,
        theatre_user_id: theatreUserId,
        status: 'confirmed',
        theatre_message: description || null,
        selected_screens: selected_screens || null,
        confirmed_at: new Date()
      });
    } else {
      // 4. Update existing quotation
      quotation.theatre_user_id = theatreUserId;
      quotation.status = 'confirmed';
      quotation.theatre_message = description || null;
      quotation.selected_screens = selected_screens || null,
      quotation.confirmed_at = new Date();
      await quotation.save();
    }

    res.status(200).json({
      success: true,
      data: quotation,
      message: 'Request submitted to Admin successfully',
    });
  } catch (error) {
    console.error('Error in confirmQuotation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all confirmed quotation requests (Theatre Requests for Admin)
// @route   GET /api/quotations/requests/theatre
// @access  Private (Admin)
exports.getTheatreRequests = async (req, res) => {
  try {
    const requests = await Quotation.findAll({
      where: {
        status: 'confirmed',
      },
      include: [
        {
          model: Ad,
          attributes: ['id', 'title', 'client', 'budget', 'impressions', 'video_url']
        },
        {
          model: TheatreUser,
          attributes: ['id', 'username', 'theatre_name', 'theatre_address', 'email']
        }
      ],
      order: [['confirmed_at', 'DESC']]
    });

    const formattedData = requests.map(req => ({
      id: req.id,
      quotation_id: req.id,
      ad_id: req.ad_id,
      theatre_user_id: req.theatre_user_id,
      amount: req.amount,
      status: req.status,
      admin_response: req.admin_response,
      admin_response_at: req.admin_response_at,
      confirmed_at: req.confirmed_at,
      notes: req.notes,
      theatre_message: req.theatre_message,
      selected_screens: req.selected_screens,
      admin_suggested_screen: req.admin_suggested_screen,
      theatre_screen_decision: req.theatre_screen_decision,
      ad: req.Ad ? {
        id: req.Ad.id,
        title: req.Ad.title,
        client: req.Ad.client,
        budget: req.Ad.budget,
        impressions: req.Ad.impressions,
        video_url: req.Ad.video_url,
      } : null,
      theatre_user: req.TheatreUser ? {
        id: req.TheatreUser.id,
        username: req.TheatreUser.username,
        theatre_name: req.TheatreUser.theatre_name,
        theatre_address: req.TheatreUser.theatre_address,
        email: req.TheatreUser.email,
      } : null,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current theatre user's quotation requests
// @route   GET /api/quotations/my-requests
// @access  Private (Theatre User)
exports.getMyQuotationRequests = async (req, res) => {
  try {
    const theatreUserId = req.user.id;

    const requests = await Quotation.findAll({
      where: {
        theatre_user_id: theatreUserId,
        status: 'confirmed'
      },
      include: [
        {
          model: Ad,
          attributes: ['id', 'title', 'client', 'budget', 'video_url']
        }
      ],
      order: [['confirmed_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching my quotation requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Theatre user responds to Admin's screen suggestion
// @route   POST /api/quotations/:id/screen-decision
// @access  Private (Theatre User)
exports.respondToScreenSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'accepted' or 'rejected'
    const theatreUserId = req.user.id;

    const quotation = await Quotation.findOne({
      where: {
        id,
        theatre_user_id: theatreUserId
      }
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation request not found' });
    }

    if (!quotation.admin_suggested_screen) {
      return res.status(400).json({ success: false, message: 'No screen suggestion found for this request' });
    }

    quotation.theatre_screen_decision = decision;

    if (decision === 'accepted') {
      // Update selected screens to the admin's suggestion
      quotation.selected_screens = [quotation.admin_suggested_screen];
      // Automatically accept the quotation if they agree to the screen?
      // User said: "The user can either Accept or Reject the Admin’s suggested screen"
      // If they accept, the negotiation is done.
    }

    await quotation.save();

    res.status(200).json({
      success: true,
      message: `Screen suggestion ${decision} successfully`,
      data: quotation
    });
  } catch (error) {
    console.error('Error responding to screen suggestion:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

