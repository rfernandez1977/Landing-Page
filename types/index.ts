export type NavItem = {
  title: string;
  href: string;
};

export type TestimonialType = {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  cta: string;
  popular?: boolean;
  originalPrice?: string;
  accountingPrice?: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
};