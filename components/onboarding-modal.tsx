'use client';

/**
 * Modal de Onboarding Guiado
 * 
 * Aparece para novos usuários e os guia pelos primeiros passos do sistema
 */

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Wallet, 
  Tag, 
  Receipt, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Bem-vinda ao Caderno de Fiado! 👋',
    description: 'Vamos configurar seu negócio em poucos passos. É rápido e fácil!',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 2,
    title: 'Meus Caixas',
    description: 'Organize seus caixas: Carteira/Mão, Conta Bancária e Caderno de Fiado. Já criamos alguns para você começar!',
    icon: Wallet,
    color: 'from-blue-500 to-indigo-600',
    action: '/accounts',
    actionLabel: 'Ver Meus Caixas',
  },
  {
    id: 3,
    title: 'Categorias Prontas',
    description: 'Criamos categorias prontas para você: "Venda de Produto", "Boleto da Fábrica", "Frete/Entrega" e mais!',
    icon: Tag,
    color: 'from-emerald-500 to-teal-600',
    action: '/categories',
    actionLabel: 'Ver Categorias',
  },
  {
    id: 4,
    title: 'Registre Sua Primeira Venda',
    description: 'Registre uma venda ou um fiado. Se marcar como "Fiado", você pode cobrar no WhatsApp com um clique!',
    icon: Receipt,
    color: 'from-purple-500 to-pink-600',
    action: '/transactions',
    actionLabel: 'Registrar Venda',
  },
  {
    id: 5,
    title: 'Cobrar no WhatsApp',
    description: 'Quando uma venda estiver pendente (fiado), aparecerá um botão "Cobrar no Zap" para você enviar mensagem automaticamente!',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 6,
    title: 'Tudo Pronto! 🎉',
    description: 'Agora você está pronta para usar o Caderno de Fiado! Registre suas vendas, controle seus gastos e nunca mais perca um fiado.',
    icon: CheckCircle2,
    color: 'from-pink-500 to-rose-600',
  },
];

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Reseta quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps([]);
    }
  }, [isOpen]);

  const currentStepData = onboardingSteps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Salva no localStorage que o onboarding foi completado
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title=""
      description=""
      size="lg"
    >
      <div className="space-y-6">
        {/* Header com ícone e título */}
        <div className="text-center">
          <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${currentStepData.color} text-white mb-4`}>
            <Icon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {currentStepData.description}
          </p>
        </div>

        {/* Indicador de progresso */}
        <div className="flex items-center justify-center gap-2">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-pink-600 w-8'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Botão de ação (se houver) */}
        {currentStepData.action && (
          <div className="text-center">
            <Link href={currentStepData.action}>
              <Button
                className={`bg-gradient-to-r ${currentStepData.color} text-white hover:opacity-90`}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = currentStepData.action!;
                }}
              >
                {currentStepData.actionLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-600 dark:text-gray-400"
          >
            Pular
          </Button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`bg-gradient-to-r ${currentStepData.color} text-white hover:opacity-90`}
            >
              {isLastStep ? 'Começar a Usar!' : 'Próximo'}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

