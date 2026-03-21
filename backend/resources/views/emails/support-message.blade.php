<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Support Message</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .header {
            background: #10b981;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
        }
        .content {
            background: white;
            padding: 20px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .field {
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .value {
            margin-top: 4px;
            font-size: 1.1em;
        }
        .message-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
            white-space: pre-wrap;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">New PULSE-EQ Support Request</h2>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">Sender Name</div>
                <div class="value">{{ $contactData['name'] }}</div>
            </div>
            
            <div class="field">
                <div class="label">Sender Email</div>
                <div class="value"><a href="mailto:{{ $contactData['email'] }}">{{ $contactData['email'] }}</a></div>
            </div>

            @if(!empty($contactData['deviceType']))
            <div class="field">
                <div class="label">Device Type</div>
                <div class="value">{{ $contactData['deviceType'] }}</div>
            </div>
            @endif

            @if(!empty($contactData['presetId']))
            <div class="field">
                <div class="label">Preset ID</div>
                <div class="value">{{ $contactData['presetId'] }}</div>
            </div>
            @endif

            <div class="field">
                <div class="label">Subject</div>
                <div class="value">{{ $contactData['subject'] }}</div>
            </div>
            
            <div class="field">
                <div class="label">Message</div>
                <div class="message-box">{{ $contactData['message'] }}</div>
            </div>
        </div>
    </div>
</body>
</html>