<script lang="ts">
  import type { LngLatLike } from "svelte-maplibre/dist/types";
  import { Sheet, PageContent, Card, Button, Icon } from "framework7-svelte";

  interface Pin {
    lngLat: LngLatLike;
    name: string;
  }

  export let sheetOpened = false;
  export let focusPin: Pin | null = null;
  export let onSheetClose: () => void = () => {};
  export let onSheetClosed: () => void = () => {};

  export let sheetView: HTMLElement | null = null;
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
  class="shadow-2xl shadow-black"
  bind:opened={sheetOpened}
  on:sheetClose={onSheetClose}
  on:sheetClosed={onSheetClosed}
>
  <div>
    <div class="swipe-handler"></div>

    <div class="sheet-modal-swipe-step" bind:this={sheetView}>
      <div
        class="display-flex padding justify-content-space-between align-items-center"
      >
        <div style="font-size: 24px" class="flex flex-col">
          <b>{focusPin?.name ?? "undefined"}</b>
          <div class="flex flex-row items-center">
            <b style="font-size: 12px">4.8</b>
            <Icon material="star" size={15} />
            <Icon material="star" size={15} />
            <Icon material="star" size={15} />
            <Icon material="star" size={15} />
            <Icon material="star" size={15} />
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row items-center">
            <Icon material="directions_walk" size={20} />
            <b style="font-size: 20px">500 m</b>
          </div>
          <b style="font-size: 12px">提供冰水、溫水、熱水</b>
        </div>
      </div>
      <div
        class="gap-2 padding-horizontal padding-bottom flex flex-row justify-content-space-between"
      >
        <Button
          large
          fill
          external
          href="https://maps.app.goo.gl/iSx7UkXQcPy71pdLA"
          target="_blank"
          class="w-full bg-black rounded-lg"
        >
          立即前往 飲水機
        </Button>
        <Button outline large class="border border-black rounded-lg">
          <Icon material="favorite_border" class="color-black" />
        </Button>
      </div>
      <swiper-container
        class="demo-swiper-multiple demo-swiper-multiple-auto"
        space-between={10}
        slides-per-view={"auto"}
      >
        <swiper-slide>Slide 1</swiper-slide>
        <swiper-slide>Slide 2</swiper-slide>
        <swiper-slide>Slide 3</swiper-slide>
      </swiper-container>
    </div>

    <PageContent class="padding-horizontal">
      <b style="font-size: 20px;">評分及評論</b>
      <Card outline class="flex flex-row px-4 py-4 gap-2 mx-0">
        <div>
          <div
            class="message-avatar w-[44px] h-[44px]"
            style="background-image:url(https://cdn.framework7.io/placeholder/people-100x100-9.jpg)"
          ></div>
        </div>
        <div class="flex flex-col gap-1">
          <b style="font-size: 12px;">@王小明</b>
          <div class="flex flex-row items-center">
            <div class="flex flex-row">
              <Icon material="star" size={15} />
              <Icon material="star" size={15} />
              <Icon material="star" size={15} />
              <Icon material="star" size={15} />
              <Icon material="star" size={15} />
            </div>
            <b style="font-size: 10px;">5天前</b>
          </div>
          <b style="font-size: 16px;">天龍人的水我喝不起</b>
        </div>
      </Card>
    </PageContent>
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

  .demo-swiper-multiple {
    margin: 0 0 35px;
    font-size: 18px;
    height: 160px;
  }

  .demo-swiper-multiple.demo-swiper-multiple-auto swiper-slide {
    width: 85%;
  }

  .demo-swiper-multiple swiper-slide {
    box-sizing: border-box;
    border: 1px solid #ccc;
    background: #fff;
    @apply rounded-lg;
  }
  .demo-swiper swiper-slide,
  .demo-swiper-multiple swiper-slide,
  .demo-swiper::part(slide),
  .demo-swiper-multiple::part(slide) {
    font-size: 25px;
    font-weight: 300;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    background: #fff;
    color: #000;
  }
</style>
