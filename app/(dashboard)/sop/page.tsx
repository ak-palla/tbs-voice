import { Metadata } from 'next';
import SopClient from './sop.client';

export const metadata: Metadata = {
  title: 'Standard Operating Procedures | TBS Dashboard',
  description: 'View and manage your company\'s Standard Operating Procedures',
};

export default function SopPage() {
  return <SopClient />;
} 