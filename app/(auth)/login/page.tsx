
"use client";
import { useSignInMutation } from '@/app/redux-query/services/authApis';
import { LoadingScreen } from '@/components/loading-screen';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [signIn, { isLoading }] = useSignInMutation();
  useEffect(() => {
    if (localStorage.getItem("accessToken")) router.replace("/");
  }, [router]);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get('email'),
        password: formData.get('password'),
      }
      const res = await signIn(data).unwrap();
      if (!res?.success) {
        throw new Error(res?.message || "Login failed")
      }
      localStorage.setItem("accessToken", res?.data?.accessToken);
      toast.success(res?.message || "Sign in successful");
      router.push("/");
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Sign in failed";
      toast.error(errorMessage)
    }
  };
  return (
    <div className="flex h-screen w-full p-4">
      {isLoading && <LoadingScreen message="Loading..." />}
      <div className="rounded overflow-hidden border border-border p-2 flex gap-1 w-full">
        <div className="hidden md:inline-block w-1/2 rounded overflow-hidden">
          <img className="h-full w-full object-cover" src="https://img.magnific.com/free-photo/hiker-watching-sunset-mountain-range_23-2151995794.jpg?t=st=1778699701~exp=1778703301~hmac=35c8a725cca0d1deb975cbe4a3cb4ea1355b133b802ba733334fa9708879e273&w=740" alt="brand" />
        </div>

        <div className="w-full flex flex-col items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="md:w-96 w-80 flex flex-col items-center justify-center">
            <h2 className="text-4xl text-gray-900 font-medium">Sign in</h2>
            <p className="text-sm text-gray-500/90 mt-3">Welcome back! Please sign in to continue</p>
            <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
              </svg>
              <input type="email" name='email' placeholder="Email id" className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
            </div>

            <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
              </svg>
              <input type="password" name='password' placeholder="Password" className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
            </div>

            <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
              <div />
              <Link className="text-sm underline" href="/forgot-password">Forgot password?</Link>
            </div>

            <button
              type="submit" className="mt-8 w-full h-11 rounded-full text-white bg-[#00ACA7] hover:opacity-90 transition-opacity">
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
