#!/bin/bash

echo "========================================"
echo "  Carpool App 启动脚本"
echo "========================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js >= 16.0.0"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "❌ 错误: Node.js 版本过低，需要 >= 16.0.0，当前版本: $(node -v)"
        exit 1
    fi
    echo "✅ Node.js 版本: $(node -v)"
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未检测到 npm，请先安装 npm >= 8.0.0"
        exit 1
    fi

    NPM_VERSION=$(npm -v | cut -d'.' -f1)
    if [ "$NPM_VERSION" -lt 8 ]; then
        echo "❌ 错误: npm 版本过低，需要 >= 8.0.0，当前版本: $(npm -v)"
        exit 1
    fi
    echo "✅ npm 版本: $(npm -v)"
}

check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo "📦 未检测到依赖，正在安装..."
        npm run install-all
        if [ $? -ne 0 ]; then
            echo "❌ 依赖安装失败"
            exit 1
        fi
        echo "✅ 依赖安装完成"
    else
        echo "✅ 依赖已安装"
    fi
}

check_env() {
    if [ ! -f "backend/.env" ]; then
        echo "⚠️  警告: backend/.env 不存在，请先配置环境变量"
        echo "   参考: backend/.env.example"
    else
        echo "✅ 环境配置已就绪"
    fi
}

start_backend() {
    echo ""
    echo "🚀 启动后端服务 (端口: 3000)..."
    npm run dev-backend
}

start_miniprogram() {
    echo ""
    echo "🚀 启动小程序开发..."
    npm run dev-miniprogram
}

show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --backend     仅启动后端服务"
    echo "  --miniprogram 仅启动小程序开发"
    echo "  --seed        初始化数据库并填充测试数据"
    echo "  --install     安装所有依赖"
    echo "  --help        显示此帮助信息"
    echo ""
}

check_node
check_npm

case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    --install)
        echo "📦 安装所有依赖..."
        npm run install-all
        exit $?
        ;;
    --seed)
        check_dependencies
        echo "🌱 初始化数据库并填充测试数据..."
        npm run seed-data
        exit $?
        ;;
    --backend)
        check_dependencies
        check_env
        start_backend
        ;;
    --miniprogram)
        check_dependencies
        start_miniprogram
        ;;
    *)
        check_dependencies
        check_env
        echo ""
        echo "请选择要启动的服务:"
        echo "  1) 后端服务"
        echo "  2) 小程序开发"
        echo "  3) 初始化数据库数据"
        echo "  4) 退出"
        read -p "请输入选项 (1-4): " choice

        case "$choice" in
            1)
                start_backend
                ;;
            2)
                start_miniprogram
                ;;
            3)
                echo "🌱 初始化数据库并填充测试数据..."
                npm run seed-data
                ;;
            4)
                echo "已退出"
                exit 0
                ;;
            *)
                echo "❌ 无效选项"
                exit 1
                ;;
        esac
        ;;
esac
