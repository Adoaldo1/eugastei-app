import { type ReactNode } from 'react';

type PageWrapperProps = {
  children: ReactNode;
};

export const PageWrapper = ({ children }: PageWrapperProps) => (
  <div className="w-full pt-20 lg:pt-[100px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 3xl:px-24 4xl:px-32 5xl:px-40">
    {children}
    {/* Padding bottom */}
    <div className="pb-8"></div>
  </div>
); 