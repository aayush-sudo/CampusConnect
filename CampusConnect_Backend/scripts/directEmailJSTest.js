import axios from 'axios';

(async () => {
  // Hardcoded EmailJS credentials (temporary test)
  const serviceId = 'service_3ge2aaq';
  const templateId = 'template_0srp2bf';
  const userId = '8pC2XcKWRJt_7GbPf';
  const resetUrl = 'http://localhost:8080/reset-password/test-token-123';
  const toEmail = 'aayush.hardas@gmail.com';

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: {
      to_email: toEmail,
      reset_url: resetUrl
    }
  };

  try {
    console.log('Sending EmailJS request (direct, hardcoded creds)...');
    const res = await axios.post('https://api.emailjs.com/api/v1.0/email/send', body, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('EmailJS response status:', res.status, res.statusText);
    console.log('Response data:', res.data);
  } catch (err) {
    console.error('EmailJS direct send error:', err.response?.status, err.response?.data || err.message);
  }
})();