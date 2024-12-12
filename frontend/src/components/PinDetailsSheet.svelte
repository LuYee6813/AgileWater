<script lang="ts">
  import urlJoin from "url-join";
  import { Sheet, Card, Button, Icon } from "framework7-svelte";
  import type { WaterDispenserResponse } from "../api/common";

  export let sheetOpened = false;
  export let focusPin: WaterDispenserResponse | null = null;
  export let onSheetClose: () => void = () => {};
  export let onSheetClosed: () => void = () => {};

  export let sheetView: HTMLElement | null = null;

  function formatTimeAgo(time: string): string {
    const now = new Date();
    const past = new Date(time);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const secondsInMinute = 60;
    const secondsInHour = 60 * 60;
    const secondsInDay = 24 * 60 * 60;
    const secondsInWeek = 7 * secondsInDay;
    const secondsInMonth = 30 * secondsInDay;
    const secondsInYear = 365 * secondsInDay;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} 秒前`;
    } else if (diffInSeconds < secondsInHour) {
      return `${Math.floor(diffInSeconds / secondsInMinute)} 分鐘前`;
    } else if (diffInSeconds < secondsInDay) {
      return `${Math.floor(diffInSeconds / secondsInHour)} 小時前`;
    } else if (diffInSeconds < secondsInWeek) {
      return `${Math.floor(diffInSeconds / secondsInDay)} 天前`;
    } else if (diffInSeconds < secondsInMonth) {
      return `${Math.floor(diffInSeconds / secondsInWeek)} 週前`;
    } else if (diffInSeconds < secondsInYear) {
      return `${Math.floor(diffInSeconds / secondsInMonth)} 個月前`;
    } else {
      return `${Math.floor(diffInSeconds / secondsInYear)} 年前`;
    }
  }
</script>

<div class="fixed top-0 left-0 z-50"></div>
<Sheet
  style="height: 90vh"
  swipeToClose
  swipeToStep
  closeByOutsideClick
  closeOnEscape
  push
  backdrop={false}
  class="shadow-2xl shadow-black "
  bind:opened={sheetOpened}
  on:sheetClose={onSheetClose}
  on:sheetClosed={onSheetClosed}
>
  <div class="swipe-handler"></div>
  <div class="page-content">
    <div class="flex flex-col gap-[10px]">
      <!-- header -->
      <div class="flex flex-col padding-horizontal padding-top">
        <div class="flex flex-row justify-between w-full">
          <span
            class="w-[70%] font-sans text-xl font-bold"
            style="font-size: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display:  max-width: 100%;"
            >{focusPin?.name ?? "undefined"}</span
          >
          <div class="flex flex-row items-center justify-end">
            <Icon material="directions_walk" size={20} />
            <span style="font-size: 20px" class="font-sans text-xl font-bold"
              >{focusPin?.distance?.toFixed(0)} m
            </span>
          </div>
        </div>

        <div class="flex flex-row justify-between items-start">
          <div class="flex flex-row items-center">
            <span style="font-size: 12px">{focusPin?.rate.toFixed(1)}</span>
            {#each Array(5) as _, index}
              {#if focusPin?.rate >= index + 1}
                <Icon material="star" size={15} />
              {:else if focusPin?.rate > index}
                <Icon material="star_half" size={15} />
              {/if}
            {/each}
          </div>
          <div class="flex flex-row justify-end">
            <span style="font-size: 12px" class="font-mono text-lg">
              {focusPin?.cold || focusPin?.warm || focusPin?.hot ? "提供" : ""}
              {[
                focusPin?.cold ? "冰水" : "",
                focusPin?.warm ? "溫水" : "",
                focusPin?.hot ? "熱水" : "",
              ]
                .filter(Boolean)
                .join("、 ")}
            </span>
          </div>
        </div>
      </div>

      <!-- button -->
      <div
        class="gap-2 padding-horizontal flex flex-row justify-content-space-between"
      >
        <Button
          large
          fill
          external
          href="https://maps.app.goo.gl/iSx7UkXQcPy71pdLA"
          target="_blank"
          class="w-full bg-black rounded-lg font-size-16 font-sans font-bold"
        >
          立即前往 飲水機
        </Button>
        <Button outline large class="border border-black rounded-lg">
          <Icon material="favorite_border" class="color-black" />
        </Button>
      </div>

      <!-- picture -->
      <div class="sheet-modal-swipe-step" bind:this={sheetView}>
        <swiper-container
          class="h-[200px]"
          space-between={10}
          slides-per-view={"auto"}
          freeMode={true}
        >
          {#if focusPin?.photos.length > 0}
            {#each focusPin?.photos as photo, i}
              <swiper-slide
                class="w-fit rounded-xl {i === 0 ? 'ml-4' : ''} {i === 9
                  ? 'mr-4'
                  : ''}"
              >
                <img
                  src={urlJoin(
                    "https://water.circuplus.org/",
                    focusPin?.path,
                    photo
                  )}
                  alt="飲水機圖片"
                  class="h-full border border-black border-1 rounded-lg"
                />
              </swiper-slide>
            {/each}
          {/if}
        </swiper-container>
      </div>

      <!-- 評論 -->
      <div class="padding-horizontal my-0">
        <span style="font-size: 20px;" class="font-sans font-semibold"
          >評分及評論</span
        >
        {#if focusPin?.reviews && focusPin.reviews.length > 0}
          {#each focusPin.reviews as review, i}
            <Card outline class="flex flex-row px-4 py-4 mx-0 my-[10px]">
              <div>
                <div
                  class="message-avatar bg-[#E6E6E6] w-[44px] h-[44px] border border-black flex items-center justify-center rounded-full"
                >
                  <Icon material="person" size={28} />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span style="font-size: 12px;" class="font-sans font-bold"
                  >@{review.username}</span
                >
                <div class="flex flex-row items-center">
                  {#each Array(5) as _, index}
                    {#if review.star >= index + 1}
                      <Icon material="star" size={15} />
                    {:else if review.star > index}
                      <Icon material="star_half" size={15} />
                    {/if}
                  {/each}
                  <span style="font-size: 10px;" class="font-sans font-regular"
                    >{formatTimeAgo(review.time)}</span
                  >
                </div>
                <span style="font-size: 16px;" class="font-sans font-regular"
                  >{review.content}</span
                >
              </div>
            </Card>
          {/each}
        {:else}
          <p class="text-center">尚無評論</p>
        {/if}
      </div>
    </div>
  </div>
</Sheet>

<style lang="postcss">
  :global(.map) {
    height: 100%;
  }

  .swipe-handler {
    height: 16px;
    position: absolute;
    left: 0;
    width: 100%;
    top: 0;
    background: #fff;
    cursor: pointer;
    z-index: 10;
  }
  .swipe-handler:after {
    content: "";
    width: 48px;
    height: 6px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -32px;
    margin-top: -3px;
    border-radius: 3px;
    background: #000000;
  }
</style>
