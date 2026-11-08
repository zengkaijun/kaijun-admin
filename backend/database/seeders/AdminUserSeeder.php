<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $username = env('ADMIN_USERNAME', 'admin');
        $password = env('ADMIN_PASSWORD');

        if ($password === null || $password === '') {
            throw new \RuntimeException('ADMIN_PASSWORD is required to seed the admin user.');
        }

        $email = str_contains($username, '@')
            ? $username
            : $username.'@kaijun.local';

        // User 模型 password 已 cast 为 hashed，这里传明文避免双重哈希
        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
    }
}
