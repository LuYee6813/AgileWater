<script lang="ts">
  import { Page } from "framework7-svelte";
  import { tick } from "svelte";
  import { MapLibre, Marker } from "svelte-maplibre";
  import type { LngLatLike } from "svelte-maplibre/dist/types";
  import PinDetailsSheet from "../components/PinDetailsSheet.svelte";

  interface Pin {
    lngLat: LngLatLike;
    name: string;
  }

  const markers: Pin[] = [
    {
      name: "台北101 - B1哺乳室",
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
    maxPitch={0}
    bind:map
    attributionControl={false}
    class="map"
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  >
    {#each markers as p}
      <Marker
        class="place-items-center rounded-full text-black
      {p === focusPin && !sheetClosing ? 'active-class' : 'h-4 w-4 bg-black'}"
        lngLat={p.lngLat}
        on:click={() => handleMarkerClick(p)}
      >
        {#if p === focusPin && !sheetClosing}
          <img src="/water-machine.png" alt="飲水機圖" />
        {/if}
      </Marker>
    {/each}
  </MapLibre>

  <PinDetailsSheet
    bind:focusPin
    bind:sheetOpened
    bind:sheetView
    onSheetClose={handleSheetClose}
    onSheetClosed={handleSheetClosed}
  />
</Page>

<style lang="postcss">
  :global(.map) {
    height: 100vh;
  }
</style>
