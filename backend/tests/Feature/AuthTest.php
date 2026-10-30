<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials_and_receive_sanctum_token(): void
    {
        $user = User::create([
            'name' => 'Laura Martínez',
            'email' => 'admin@qubitpos.co',
            'password' => Hash::make('qubitpos'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@qubitpos.co',
            'password' => 'qubitpos',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email'],
            ]);

        $token = $response->json('token');
        $this->assertNotEmpty($token);

        // Consultar /api/auth/me con el token
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.email', 'admin@qubitpos.co');
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::create([
            'name' => 'Laura Martínez',
            'email' => 'admin@qubitpos.co',
            'password' => Hash::make('qubitpos'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@qubitpos.co',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::create([
            'name' => 'Carlos Ramírez',
            'email' => 'carlos@qubitpos.co',
            'password' => Hash::make('secret123'),
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        // Limpiar el estado de guardia en el test container
        app('auth')->forgetGuards();

        // El token revocado ya no puede consultar /api/auth/me
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(401);
    }
}
