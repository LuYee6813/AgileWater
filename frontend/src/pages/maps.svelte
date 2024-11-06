<script lang="ts">
  import {
    Page,
    Sheet,
    BlockTitle,
    PageContent,
    Block,
    Button,
    Icon,
  } from "framework7-svelte";
  import { tick } from "svelte";
  import { MapLibre, Marker } from "svelte-maplibre";
  import type { LngLatLike } from "svelte-maplibre/dist/types";

  interface Pin {
    lngLat: LngLatLike;
    name: string;
  }

  const markers: Pin[] = [
    {
      name: "敏捷飲水機",
      lngLat: [121.5635931, 25.0334858] as LngLatLike,
    },
  ];

  let map: maplibregl.Map | null = null;

  let center: LngLatLike = [121.5635931, 25.0334858];
  let zoom = 14;

  let sheetOpened = false;
  let sheetClosing = false;

  let focusPin: Pin | null = null;

  let sheetView: HTMLElement | null = null;

  async function handleMarkerClick(pin: Pin) {
    focusPin = pin;
    sheetOpened = true;

    await tick();

    if (map) {
      let offestY = 0;
      if (sheetView) {
        offestY = (sheetView.getBoundingClientRect().height * -1) / 2;
        console.log(offestY);
      }

      map.flyTo({
        center: pin.lngLat,
        zoom: 16,
        duration: 1000,
        pitch: 60,
        offset: [0, offestY],
      });
    }
  }

  function handleSheetClose() {
    const lastFocusPin = focusPin;
    sheetClosing = true;

    if (map) {
      map.flyTo({
        center: lastFocusPin.lngLat,
        zoom,
        pitch: 0,
        duration: 1000,
      });
    }
  }

  function handleSheetClosed() {
    focusPin = null;
    sheetClosing = false;
  }
</script>

<Page noNavbar={true}>
  <MapLibre
    {center}
    {zoom}
    bind:map
    attributionControl={false}
    class="map"
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  >
    {#each markers as p}
      <Marker
        class="place-items-center rounded-full text-black shadow-2xl shadow-black {p ===
          focusPin && !sheetClosing
          ? 'h-8 w-8 bg-blue-400 '
          : 'h-4 w-4 bg-blue-300'}"
        lngLat={p.lngLat}
        on:click={() => {
          handleMarkerClick(p);
        }}
      />
    {/each}
  </MapLibre>

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
    on:sheetClose={handleSheetClose}
    on:sheetClosed={handleSheetClosed}
  >
    <div bind:this={sheetView}>
      <div class="swipe-handler"></div>

      <div class="sheet-modal-swipe-step">
        <div
          class="display-flex padding justify-content-space-between align-items-center"
        >
          <div style="font-size: 18px">
            <b>{focusPin?.name ?? "undefined"}</b>
          </div>
          <div style="font-size: 22px"><b>500 m</b></div>
        </div>
        <div class="padding-horizontal padding-bottom">
          <Button
            large
            fill
            external
            href="https://maps.app.goo.gl/iSx7UkXQcPy71pdLA"
            target="_blank"
            ><Icon f7="arrow_up_right_diamond_fill" size="20px" class="mr-2" /> Navigation</Button
          >
          <div class="margin-top text-align-center">
            Swipe up for more details
          </div>
        </div>
      </div>
    </div>

    <PageContent class="padding-horizontal">
      <swiper-container
        pagination={true}
        class="demo-swiper-multiple demo-swiper-multiple-auto"
        space-between={10}
        slides-per-view={"auto"}
      >
        <swiper-slide>Slide 1</swiper-slide>
        <swiper-slide>Slide 2</swiper-slide>
        <swiper-slide>Slide 3</swiper-slide>
        <swiper-slide>Slide 4</swiper-slide>
        <swiper-slide>Slide 5</swiper-slide>
        <swiper-slide>Slide 6</swiper-slide>
        <swiper-slide>Slide 7</swiper-slide>
        <swiper-slide>Slide 8</swiper-slide>
        <swiper-slide>Slide 9</swiper-slide>
        <swiper-slide>Slide 10</swiper-slide>
      </swiper-container>
    </PageContent>
  </Sheet>
</Page>

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
    width: 36px;
    height: 6px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -18px;
    margin-top: -3px;
    border-radius: 3px;
    background: #666;
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
