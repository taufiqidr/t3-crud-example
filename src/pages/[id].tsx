import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

const Single = () => {
  const messageId = useRouter().query.id;
  const { data: session } = useSession();

  const { data: message, isLoading } = trpc.guestbook.getOne.useQuery({
    id: messageId as string,
  });

  const utils = trpc.useContext();
  const router = useRouter();
  const deleteMessage = trpc.guestbook.deleteMessage.useMutation({
    onMutate: () => {
      utils.guestbook.getAll.cancel();
      const optimisticUpdate = utils.guestbook.getAll.getData();

      if (optimisticUpdate) {
        utils.guestbook.getAll.setData(
          optimisticUpdate.filter((msg) => msg.id != message?.id)
        );
      }
    },
    onSettled: () => {
      router.push("/");
    },
  });
  if (isLoading) return <div>Loading...</div>;

  if (!message && !isLoading) return <div>Message not found</div>;
  return (
    <div className="m-3 flex flex-col gap-y-2">
      <p className="text-xl">{message?.message}</p>
      {session?.user?.email === message?.user.email && (
        <>
          <button
            className="w-40 border"
            onClick={() => {
              deleteMessage.mutate({
                id: message?.id as string,
              });
            }}
          >
            Delete
          </button>
          <Link
            href={`${message?.id}/update`}
            className="w-40 border text-center"
          >
            Update
          </Link>
        </>
      )}
    </div>
  );
};

export default Single;

// export async function getServerSideProps(context) {
//   const messageId = context.query.id;
//   const { data: message, isLoading } = trpc.guestbook.getOne.useQuery({
//     id: messageId as string,
//   });

//   return {
//     props: {
//       message: message,
//       isLoading: isLoading,
//     }, // will be passed to the page component as props
//   };
// }
