import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

interface ArticleProps {
  title: string;
  author: string;
  articleUrl: string;
  imageUrl: string;
  createdAt: Date;
}

export default component$<ArticleProps>(
  ({ articleUrl, imageUrl, title, author, createdAt }) => {
    return (
      <article class="flex flex-col overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-shadow duration-200 hover:shadow-xl">
        <Link href={`/article/${articleUrl}`}>
          <img
            class="h-auto w-full object-contain"
            src={imageUrl}
            alt={title}
            width={0}
            height={0}
          />
        </Link>
        <div class="space-y-2 p-4">
          <Link href={`/article/${articleUrl}`}>
            <h1 class="text-2xl font-semibold transition-colors duration-200 hover:text-purple-500">
              {title}
            </h1>
          </Link>
          <div class="flex justify-between text-sm text-gray-400">
            <span>{author}</span>
            <span>{createdAt.toDateString()}</span>
          </div>
        </div>
      </article>
    );
  },
);
