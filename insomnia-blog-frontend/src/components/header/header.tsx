import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuHome, LuUpload } from "@qwikest/icons/lucide";

export default component$(() => {
  return (
    <nav
      id="navbar"
      class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-8 py-4"
    >
      <Link href="/">
        <h1 class="text-3xl font-bold transition-transform duration-200 hover:scale-105 hover:text-purple-500">
          <LuHome />
        </h1>
      </Link>
      <Link href="/article/upload">
        <h1 class="text-3xl font-bold transition-transform duration-200 hover:scale-105 hover:text-purple-500">
          <LuUpload />
        </h1>
      </Link>
    </nav>
  );
});
