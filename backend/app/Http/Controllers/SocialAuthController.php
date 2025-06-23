<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to Google OAuth provider
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user already exists with this Google ID
            $user = User::where('google_id', $googleUser->getId())->first();

            if ($user) {
                // User exists, log them in
                Auth::login($user);
                $request->session()->regenerate();

                return $this->redirectToFrontend('success', $user);
            }

            // Check if user exists with this email (but no Google ID)
            $existingUser = User::where('email', $googleUser->getEmail())->first();

            if ($existingUser) {
                // User exists with same email but different auth method
                // Based on requirements, we keep them separate
                return $this->redirectToFrontend('error', null, 'An account with this email already exists. Please use email/password login.');
            }

            // Create new user
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar_url' => $googleUser->getAvatar(),
                'password' => null, // No password for OAuth users
            ]);

            Auth::login($user);
            $request->session()->regenerate();

            return $this->redirectToFrontend('success', $user);

        } catch (\Exception $e) {
            \Log::error('Google OAuth error: ' . $e->getMessage());
            return $this->redirectToFrontend('error', null, 'Authentication failed. Please try again.');
        }
    }

    /**
     * Redirect to frontend with appropriate parameters
     */
    private function redirectToFrontend($status, $user = null, $message = null)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5174');

        $params = ['oauth_status' => $status];

        if ($message) {
            $params['message'] = $message;
        }


        $queryString = http_build_query($params);

        return redirect($frontendUrl . '/oauth-callback?' . $queryString);
    }
}
