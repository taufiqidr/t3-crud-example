import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const Messages = () => {
  const { data: messages, isLoading } = trpc.guestbook.getAll.useQuery();

  if (isLoading) return <div>Fetching messages...</div>;

  return (
    <div className="flex flex-col gap-4">
      {messages?.map((msg, index) => {
        return (
          <div key={index} className="border p-2">
            <Link href={`${msg.id}`}>
              <p>{msg.message}</p>
              <span>- {msg.name}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const Form = () => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const utils = trpc.useContext();
  const postMessage = trpc.guestbook.postMessage.useMutation({
    onMutate: () => {
      utils.guestbook.getAll.cancel();
      const optimisticUpdate = utils.guestbook.getAll.getData();

      if (optimisticUpdate) {
        utils.guestbook.getAll.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.guestbook.getAll.invalidate();
    },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        if (session !== null) {
          postMessage.mutate({
            name: session.user?.name as string,
            message,
          });
        }

        setMessage("");
      }}
    >
      <input
        type="text"
        value={message}
        placeholder="Your message..."
        minLength={2}
        maxLength={100}
        onChange={(event) => setMessage(event.target.value)}
        className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
};

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-3xl">Guestbook</h1>
      <p>
        Tutorial for <code>create-t3-app</code>
      </p>

      <div className="pt-10">
        <div>
          {session ? (
            <>
              <p>hi {session.user?.name}</p>

              <button onClick={() => signOut()}>Logout</button>

              <div className="pt-6">
                <Form />
              </div>
            </>
          ) : (
            <button onClick={() => signIn("discord")}>
              Login with Discord
            </button>
          )}
          <div className="pt-10">
            <Messages />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
