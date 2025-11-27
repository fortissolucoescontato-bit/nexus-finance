'use client';

/**
 * Wrapper Client Component para o Onboarding Modal
 * 
 * Este componente verifica se o usuário já completou o onboarding
 * e exibe o modal se necessário
 */

import { useEffect, useState } from 'react';
import { OnboardingModal } from '@/components/onboarding-modal';

interface OnboardingWrapperProps {
  isNewUser: boolean;
}

export function OnboardingWrapper({ isNewUser }: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Verifica se o onboarding já foi completado
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    
    // Se é um novo usuário e o onboarding não foi completado, mostra o modal
    if (isNewUser && !onboardingCompleted) {
      // Pequeno delay para melhor UX
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
    }
  }, [isNewUser]);

  const handleComplete = () => {
    setShowOnboarding(false);
  };

  const handleClose = () => {
    setShowOnboarding(false);
  };

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}

