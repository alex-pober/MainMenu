export const dynamic = "force-dynamic";
import Link from "next/link"
 
export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p>Could not find the requested resource</p>
      <Link 
        href="/"
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Return Home
      </Link>
    </div>
  )
}
