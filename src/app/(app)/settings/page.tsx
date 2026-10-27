"use client";

import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import LoginPrompt from "@/components/LoginPrompt";
import Skeleton from "@/components/Skeleton";
import type { Plan } from "@/types/book";

const planLabel: Record<Plan, string> = {
  basic: "Basic",
  premium: "Premium",
  "premium-plus": "Premium Plus",
};

function SettingsSkeleton() {
  return (
    <>
      <div className="setting__content">
        <Skeleton height={20} width={220} />
        <Skeleton height={16} width={120} />
        <Skeleton height={40} width={180} style={{ marginTop: 8 }} />
      </div>
      <div className="setting__content">
        <Skeleton height={20} width={80} />
        <Skeleton height={16} width={200} />
      </div>
    </>
  );
}

export default function SettingsPage() {
  const { user, authReady, plan, subscriptionReady } = useAppSelector((s) => s.user);

  let content;
  if (!authReady || (user && !subscriptionReady)) {
    content = <SettingsSkeleton />;
  } else if (!user) {
    content = <LoginPrompt text="Log in to your account to see your details." />;
  } else {
    content = (
      <>
        <div className="setting__content">
          <div className="settings__sub--title">Your Subscription plan</div>
          <div className="settings__text">{planLabel[plan]}</div>
          {plan === "basic" && (
            <Link href="/choose-plan" className="btn settings__upgrade--btn">
              Upgrade to Premium
            </Link>
          )}
        </div>
        <div className="setting__content">
          <div className="settings__sub--title">Email</div>
          <div className="settings__text">{user.email ?? "—"}</div>
        </div>
      </>
    );
  }

  return (
    <div className="row">
      <div className="container">
        <div className="section__title page__title">Settings</div>
        {content}
      </div>
    </div>
  );
}
