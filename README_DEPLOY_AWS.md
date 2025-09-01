# Despliegue AWS - FacturaMovil POS Web (Next.js)

## 1) Resumen
Aplicación Next.js 13 (standalone) empaquetada con Docker. Se recomienda pipeline: CodeBuild → ECR → ECS Fargate (ALB).

## 2) Artefactos incluidos
- `Dockerfile` (multi-stage, Node 18, output standalone)
- `.dockerignore`
- `.env.production.example` (plantilla sin secretos)
- `buildspec.yml` (ejemplo CodeBuild → ECR)

## 3) Variables de entorno
- Secretas (usar AWS Secrets Manager / SSM Parameter Store):
  - `PEXELS_API_KEY`
- Públicas (no sensibles; pueden ir como env estándar o ConfigMap):
  - `NEXT_PUBLIC_API_BASE_URL` (ej: http://produccion.facturamovil.cl)
  - `NEXT_PUBLIC_COMPANY_ID` (ej: 37)

Sugeridas adicionales:
- `NEXT_TELEMETRY_DISABLED=1`
- `NODE_ENV=production`

## 4) Build con CodeBuild → ECR
Requisitos previos:
- Repositorio ECR creado (nombre sugerido: `fm-pos-web`)
- Rol de servicio con permisos ECR (push/pull)

`buildspec.yml` ya incluido (publica a ECR y genera `imagedefinitions.json`).

## 5) ECS Fargate (servicio + tarea)
- Imagen: `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/fm-pos-web:latest`
- CPU / Memoria recomendada: 1 vCPU / 2 GB RAM
- Puerto del contenedor: 3000
- Health check ALB: HTTP GET `/` (200)
- Logs: CloudWatch Logs (sugerido nombre: `/ecs/fm-pos-web`)
- Variables:
  - `PEXELS_API_KEY` desde Secrets Manager (envFrom secrets)
  - `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_COMPANY_ID` como env normales
- Persistencia opcional:
  - Montar EFS en `/app/.data` si se requiere conservar `image-config.json`
    - Punto de montaje: `/app/.data`
    - Permisos: lecto-escritura

## 6) Network / ALB
- ALB con Target Group (HTTP 3000) → ECS Service
- Listener 443 con certificado ACM
- Security Groups: permitir 443 público; salida a Internet para consumir Pexels / APIs externas

## 7) Comandos locales de validación
Build local:
```bash
docker build -t fm-pos-web:latest .
```
Run local:
```bash
docker run -p 3000:3000 \
  --env-file .env.production \
  -v "$(pwd)/.data:/app/.data" \
  fm-pos-web:latest
```
URL: http://localhost:3000

## 8) Notas de seguridad
- Nunca exponer `PEXELS_API_KEY` en variables `NEXT_PUBLIC_*` ni en el repositorio
- Usar Secrets Manager / SSM para inyectar secretos en runtime

## 9) Troubleshooting
- `localStorage is not defined` en APIs: corregido; el rate limiter usa memoria en servidor
- ALB 502: validar `PORT=3000` y health check en `/`
- CORS a APIs externas: se usa proxy interno `/api/proxy`

## 10) Contacto / Handover
Entregar a operación:
- URI de imagen ECR + tag
- Variables y secretos definidos (nombres en Secrets Manager)
- Requisitos de red (ALB + SG)
- Decisión de persistencia (EFS sí/no)
