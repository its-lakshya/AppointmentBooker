'use client'
export default function Home() {
  return (
    <div className='flex flex-col'>
      Hello
      <button className='w-fit border rounded-full bg-red-300 cursor-pointer' onClick={async () => {
        await fetch("/api/emails", {method: 'POST'});
      }}>
        Send Email
      </button>
    </div>
  );
}
