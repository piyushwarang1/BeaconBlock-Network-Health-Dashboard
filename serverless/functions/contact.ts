import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contact = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Request body is required'
        })
      };
    }

    const formData: ContactFormData = JSON.parse(event.body);

    // Validate required fields
    const { name, email, subject, message } = formData;
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'All fields are required'
        })
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }

    // Log the contact form submission (in production, you'd store this in a database or send email)
    console.log('Contact form submission:', {
      ...formData,
      timestamp: new Date().toISOString(),
      ip: event.requestContext?.identity?.sourceIp
    });

    // In a real application, you might:
    // 1. Store in a database (DynamoDB, PostgreSQL, etc.)
    // 2. Send an email notification
    // 3. Add to a CRM system
    // 4. Send to a message queue for processing

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Contact form error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    };
  }
};