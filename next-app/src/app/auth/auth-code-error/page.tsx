import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold">驗證連結無效或已過期</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        您的認證連結可能已過期，或是已經被使用過了。
                    </p>
                </div>
                <div className="mt-5">
                    <Link
                        href="/settings"
                        className="font-medium text-indigo-500 hover:text-indigo-400"
                    >
                        返回設定頁面
                    </Link>
                </div>
            </div>
        </div>
    )
}
