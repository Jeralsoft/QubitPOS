<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>QubitPOS · Backend API & Plataforma ERP</title>
    <meta http-equiv="refresh" content="3;url=http://localhost:3001">
    <style>
        :root {
            --bg-color: #070a13;
            --card-bg: #0d1527;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
            --success: #10b981;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 580px;
            width: 100%;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(16, 185, 129, 0.12);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        .badge .dot {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--success);
        }
        h1 {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            color: var(--text-muted);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 28px;
        }
        .cta-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: var(--primary);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5);
            width: 100%;
        }
        .cta-btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.6);
        }
        .info-grid {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            text-align: left;
        }
        .info-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid var(--border);
        }
        .info-label {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-muted);
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 13px;
            font-weight: 600;
            color: #ffffff;
            font-family: ui-monospace, monospace;
        }
        .redirect-notice {
            margin-top: 18px;
            font-size: 13px;
            color: var(--text-muted);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge">
            <span class="dot"></span>
            Backend API Operacional · Laravel 13
        </div>

        <h1>QubitPOS Enterprise</h1>
        <p>El servidor API está funcionando al 100%. Esta dirección corresponde al motor backend. Para interactuar con la interfaz de usuario, caja y facturación, accede al frontend.</p>

        <a href="http://localhost:3001" class="cta-btn">
            🚀 Abrir Sistema POS (http://localhost:3001)
        </a>

        <div class="redirect-notice">
            Redireccionando automáticamente a la aplicación en 3 segundos...
        </div>

        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Usuario Demo</div>
                <div class="info-value">admin@qubitpos.co</div>
            </div>
            <div class="info-item">
                <div class="info-label">Contraseña</div>
                <div class="info-value">qubitpos</div>
            </div>
            <div class="info-item">
                <div class="info-label">API Endpoints</div>
                <div class="info-value">http://127.0.0.1:8000/api</div>
            </div>
            <div class="info-item">
                <div class="info-label">Frontend URL</div>
                <div class="info-value">http://localhost:3001</div>
            </div>
        </div>
    </div>
</body>
</html>
