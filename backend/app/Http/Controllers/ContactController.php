<?php

namespace App\Http\Controllers;

use App\Mail\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Handle the incoming contact form submission.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'deviceType' => 'nullable|string|max:255',
            'presetId' => 'nullable|string|max:255',
        ]);

        // Security: Ensure the email matches the authenticated user's email
        // and sanitize all inputs to prevent malicious content.
        $user = $request->user();
        $validated['email'] = $user->email;
        $validated['name'] = $user->name;

        // Sanitize all string fields
        $sanitizedData = [
            'name' => strip_tags($validated['name']),
            'email' => $validated['email'], // Email is already validated
            'subject' => strip_tags($validated['subject']),
            'message' => strip_tags($validated['message']),
            'deviceType' => isset($validated['deviceType']) ? strip_tags($validated['deviceType']) : null,
            'presetId' => isset($validated['presetId']) ? strip_tags($validated['presetId']) : null,
        ];

        $supportEmail = env('MAIL_SUPPORT_ADDRESS', 'support@pulse-eq.com');

        Mail::to($supportEmail)->send(new SupportMessage($sanitizedData));

        return response()->json([
            'message' => 'Your message has been sent successfully. We will get back to you shortly.',
        ]);
    }
}
