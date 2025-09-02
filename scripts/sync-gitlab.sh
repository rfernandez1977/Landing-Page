#!/bin/bash

# Script de Sincronización Automática con GitLab
# Factura Movil POS Web

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Función para verificar estado de Git
check_git_status() {
    log "Verificando estado de Git..."
    
    if [ -n "$(git status --porcelain)" ]; then
        warning "Hay cambios sin commitear:"
        git status --short
        read -p "¿Deseas continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Operación cancelada por el usuario"
            exit 0
        fi
    fi
}

# Función para sincronizar con GitLab
sync_with_gitlab() {
    log "Sincronizando con GitLab..."
    
    # Fetch de cambios remotos
    git fetch gitlab
    
    # Verificar si hay cambios en develop
    if [ "$(git rev-list --count develop..gitlab/develop)" -gt 0 ]; then
        warning "Hay cambios en GitLab develop que no tienes localmente"
        git log develop..gitlab/develop --oneline
        read -p "¿Deseas hacer pull de estos cambios? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git pull gitlab develop
            success "Pull completado desde GitLab develop"
        fi
    fi
    
    # Push de cambios locales
    if [ "$(git rev-list --count gitlab/develop..develop)" -gt 0 ]; then
        log "Enviando cambios locales a GitLab develop..."
        git push gitlab develop
        success "Push completado a GitLab develop"
    else
        log "No hay cambios locales para enviar"
    fi
}

# Función para crear feature branch
create_feature_branch() {
    read -p "Nombre de la feature branch (sin 'feature/'): " feature_name
    if [ -n "$feature_name" ]; then
        branch_name="feature/$feature_name"
        log "Creando feature branch: $branch_name"
        git checkout -b "$branch_name"
        success "Feature branch '$branch_name' creada y activada"
    fi
}

# Función para crear hotfix branch
create_hotfix_branch() {
    read -p "Nombre del hotfix (sin 'hotfix/'): " hotfix_name
    if [ -n "$hotfix_name" ]; then
        branch_name="hotfix/$hotfix_name"
        log "Creando hotfix branch: $branch_name"
        git checkout main
        git pull origin main
        git checkout -b "$branch_name"
        success "Hotfix branch '$branch_name' creada y activada"
    fi
}

# Función para merge a develop
merge_to_develop() {
    current_branch=$(git branch --show-current)
    if [[ $current_branch == feature/* ]] || [[ $current_branch == hotfix/* ]]; then
        log "Merging $current_branch a develop..."
        git checkout develop
        git pull gitlab develop
        git merge "$current_branch"
        git push gitlab develop
        success "Merge completado a develop"
        
        # Eliminar feature branch local
        git branch -d "$current_branch"
        log "Feature branch local eliminada"
    else
        warning "No estás en una feature o hotfix branch"
    fi
}

# Función para crear merge request
create_merge_request() {
    current_branch=$(git branch --show-current)
    if [[ $current_branch == feature/* ]] || [[ $current_branch == hotfix/* ]]; then
        log "Creando Merge Request en GitLab..."
        echo "URL para crear Merge Request:"
        echo "https://gitlab.com/facturamovil/nueva-pagina-web/-/merge_requests/new"
        echo "Source branch: $current_branch"
        echo "Target branch: develop"
    else
        warning "No estás en una feature o hotfix branch"
    fi
}

# Función para mostrar estado actual
show_status() {
    log "Estado actual del repositorio:"
    echo "---"
    git status --short
    echo "---"
    echo "Branches:"
    git branch -vv
    echo "---"
    echo "Remotes:"
    git remote -v
}

# Menú principal
show_menu() {
    echo
    echo "🔄 Sincronización GitLab - Factura Movil POS Web"
    echo "================================================"
    echo "1. Verificar estado de Git"
    echo "2. Sincronizar con GitLab"
    echo "3. Crear feature branch"
    echo "4. Crear hotfix branch"
    echo "5. Merge a develop"
    echo "6. Crear Merge Request"
    echo "7. Mostrar estado actual"
    echo "8. Salir"
    echo
}

# Función principal
main() {
    while true; do
        show_menu
        read -p "Selecciona una opción (1-8): " -n 1 -r
        echo
        
        case $REPLY in
            1) check_git_status ;;
            2) sync_with_gitlab ;;
            3) create_feature_branch ;;
            4) create_hotfix_branch ;;
            5) merge_to_develop ;;
            6) create_merge_request ;;
            7) show_status ;;
            8) 
                log "¡Hasta luego!"
                exit 0
                ;;
            *) 
                error "Opción inválida. Por favor selecciona 1-8."
                ;;
        esac
        
        echo
        read -p "Presiona Enter para continuar..."
    done
}

# Ejecutar función principal
main "$@"
