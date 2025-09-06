import AuthPage from '@/components/auth/AuthPage';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-grid-slate-50 p-4 sm:p-8">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#d1d7f4,transparent_1.5px)] [background-size:24px_24px]"></div>
      <AuthPage />
    </main>
  );
}
