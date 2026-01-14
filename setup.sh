#!/bin/bash

# Script de inicialização do frontend
# Este script ajuda a configurar o ambiente do frontend pela primeira vez

echo "🚀 Configurando o frontend do AI Email Sorter..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js (versão 20 ou superior)."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js versão 20 ou superior é recomendada. Versão atual: $(node -v)"
fi

# Instalar dependências
echo "📥 Instalando dependências do npm..."
npm install

echo ""
echo "✅ Configuração do frontend concluída!"
echo ""
echo "📋 Para iniciar o servidor de desenvolvimento:"
echo "   npm run dev"
echo ""


