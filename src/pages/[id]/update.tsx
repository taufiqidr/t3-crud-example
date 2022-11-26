import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";

const UpdateMessage = () => {
  const messageId = useRouter().query.id;

  const { data: session } = useSession();

  const { data, isLoading } = trpc.guestbook.getOne.useQuery({
    id: messageId as string,
  });

  useEffect(() => {
    if (data) setMessage(data?.message);
  }, [data]);

  const utils = trpc.useContext();
  const router = useRouter();

  const updateMessage = trpc.guestbook.updateMessage.useMutation({
    onMutate: () => {
      utils.guestbook.getOne.cancel();
      const optimisticUpdate = utils.guestbook.getOne.getData({
        id: messageId as string,
      });

      if (optimisticUpdate) {
        utils.guestbook.getOne.setData(optimisticUpdate);
      }
    },
    onSuccess: () => {
      utils.guestbook.getAll.invalidate();
      router.push(`/${messageId}`);
    },
  });

  const [message, setMessage] = useState("");

  if (isLoading) return <div>Loading...</div>;

  if (session?.user?.email !== data?.user?.email || !session)
    return <div>Unauthorized</div>;

  return (
    <div className="m-3 flex flex-col gap-y-2">
      <p>Update Message</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (session !== null) {
            updateMessage.mutate({
              id: messageId as string,
              message: message as string,
            });
          }

          setMessage("");
        }}
      >
        <input
          type="text"
          className="w-60 border bg-inherit text-inherit"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="w-40 border bg-inherit text-inherit" type="submit">
          Save
        </button>
      </form>
    </div>
  );
};

export default UpdateMessage;
