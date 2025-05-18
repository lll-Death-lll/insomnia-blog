import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

interface ArticleProps {
  title: string;
  author: string;
  articleUrl: string;
  imageUrl: string;
  createdAt: Date;
}

export default component$<ArticleProps>((props) => {
  return (
    <>
      <article class="m-2 flex flex-col justify-between gap-2 p-2">
        <div>
          <Link href={`/article/${props.articleUrl}`}>
            <img
              class="h-auto w-auto"
              src={props.imageUrl}
              alt={props.title}
              height={0}
              width={0}
            />
          </Link>
        </div>
        <div>
          <div>
            <Link href={`/article/${props.articleUrl}`}>
              <h1 class="text-xl font-semibold lg:text-2xl">{props.title}</h1>
            </Link>
          </div>
          <div class="flex flex-row flex-wrap justify-between">
            <h2 class="text-sm font-normal md:text-base">{props.author}</h2>
            <h2 class="text-sm font-light md:text-base">
              {props.createdAt.toDateString()}
            </h2>
          </div>
        </div>
      </article>
    </>
  );
});
