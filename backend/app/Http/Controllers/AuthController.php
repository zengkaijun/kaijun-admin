<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $username = $credentials['username'];
        $email = str_contains($username, '@')
            ? $username
            : $username.'@kaijun.local';

        if (! Auth::attempt(['email' => $email, 'password' => $credentials['password']], true)) {
            throw ValidationException::withMessages([
                'username' => ['用户名或密码错误'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => $this->userPayload($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    /**
     * @return array{id: int, name: string, email: string, username: string}
     */
    private function userPayload(User $user): array
    {
        $username = str_ends_with($user->email, '@kaijun.local')
            ? strstr($user->email, '@', true)
            : $user->email;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $username ?: $user->email,
        ];
    }
}
