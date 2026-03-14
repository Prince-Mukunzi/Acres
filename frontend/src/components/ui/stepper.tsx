"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StepperContextType {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  totalSteps: number;
  next: () => void;
  prev: () => void;
}

const StepperContext = React.createContext<StepperContextType | null>(null);

function useStepper() {
  const context = React.useContext(StepperContext);

  if (!context) {
    throw new Error("Stepper components must be used within <Stepper>");
  }

  return context;
}

interface StepperProps {
  children: React.ReactNode;
  defaultStep?: number;
  totalSteps: number;
}

export function Stepper({
  children,
  defaultStep = 1,
  totalSteps,
}: StepperProps) {
  const [step, setStep] = React.useState(defaultStep);

  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <StepperContext.Provider value={{ step, setStep, totalSteps, next, prev }}>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        {children}
      </div>
    </StepperContext.Provider>
  );
}

interface StepperListProps {
  children: React.ReactNode;
}

export function StepperList({ children }: StepperListProps) {
  const { step, totalSteps } = useStepper();

  const progress = totalSteps > 1 ? ((step - 1) / (totalSteps - 1)) * 100 : 100;

  return (
    <div className="relative flex items-center justify-between w-full">
      <div className="absolute top-5 left-0 w-full px-10 -z-10">
        <Progress
          value={progress}
          className="h-1 transition-all duration-500"
        />
      </div>

      {children}
    </div>
  );
}

interface StepperItemProps {
  step: number;
  children: React.ReactNode;
  className?: string;
}

export function StepperItem({
  step: stepValue,
  children,
  className,
}: StepperItemProps) {
  const { step } = useStepper();

  const active = step === stepValue;
  const completed = step > stepValue;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-2 flex-1",
        className
      )}
      data-active={active}
      data-completed={completed}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              active,
              completed,
            })
          : child
      )}
    </div>
  );
}

interface StepperIndicatorProps {
  icon?: React.ElementType;
  active?: boolean;
  completed?: boolean;
}

export function StepperIndicator({
  icon: Icon,
  active,
  completed,
}: StepperIndicatorProps) {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full border-2 flex items-center justify-center bg-background transition-colors",
        active && "border-primary text-primary shadow",
        completed && "border-primary bg-primary text-primary-foreground"
      )}
    >
      {completed ? (
        <Check className="h-5 w-5" />
      ) : Icon ? (
        <Icon className="h-5 w-5" />
      ) : null}
    </div>
  );
}

interface StepperLabelProps {
  title: string;
  description?: string;
  active?: boolean;
}

export function StepperLabel({
  title,
  description,
  active,
}: StepperLabelProps) {
  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-sm font-medium",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {title}
      </p>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

interface StepperContentProps {
  step: number;
  children: React.ReactNode;
}

export function StepperContent({
  step: stepValue,
  children,
}: StepperContentProps) {
  const { step } = useStepper();

  if (step !== stepValue) return null;

  return (
    <div className="border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2">
      {children}
    </div>
  );
}

export function StepperNext({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { next, step, totalSteps } = useStepper();

  return (
    <Button onClick={next} disabled={step === totalSteps} className={className}>
      {children}
    </Button>
  );
}

export function StepperPrev({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { prev, step } = useStepper();

  return (
    <Button onClick={prev} disabled={step === 1} className={className}>
      {children}
    </Button>
  );
}
