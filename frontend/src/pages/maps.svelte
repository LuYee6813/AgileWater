<script lang="ts">
  import { Button, Icon, Page } from "framework7-svelte";
  import { onDestroy, onMount, tick } from "svelte";
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
  let userPin: LngLatLike = null;

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

  const locateUser = () => {
    if (!navigator.geolocation) {
      console.error("您的设备不支持地理定位功能。");
      return;
    }

    if (userPin == null) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userPin = [longitude, latitude];
        },
        (error) => {
          console.error("定位失败：", error);
        }
      );
    }

    map.flyTo({
      center: userPin,
      zoom,
      speed: 1.2,
    });
  };

  onMount(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(updateUserPosition, () => {}, {
        enableHighAccuracy: true,
      });
    } else {
      alert("瀏覽器不支援地理定位功能。");
    }
  });

  // 更新用戶位置
  function updateUserPosition(position) {
    const { latitude, longitude } = position.coords;
    userPin = [longitude, latitude];
  }

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
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
    <!-- user location -->
    <Marker lngLat={userPin} class="relative">
      <div
        class="h-4 w-4 bg-[#7D7DF1] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      ></div>
      <div
        class="h-20 w-20 bg-[#3B3BD026] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      ></div>
    </Marker>
  </MapLibre>

  <PinDetailsSheet
    bind:focusPin
    bind:sheetOpened
    bind:sheetView
    onSheetClose={handleSheetClose}
    onSheetClosed={handleSheetClosed}
  />
  <div
    class="flex flex-row justify-center w-full pb-24 fixed bottom-0 z-5 pointer-events-none"
  >
    <div class="w-9/12 flex flex-row justify-between">
      <Button
        outline
        class="w-[62px] h-[62px] border-[1px] border-black bg-white rounded-[10px] pointer-events-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
      >
        <Icon material="search" size="28px" class="color-black"></Icon>
      </Button>
      <Button
        on:click={locateUser}
        outline
        class="w-[62px] h-[62px] border-[1px] border-black bg-white rounded-[10px] pointer-events-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
      >
        <Icon material="my_location" size="28px" class="color-black"></Icon>
      </Button>
      <Button
        outline
        class="w-[62px] h-[62px] border-[1px] border-black bg-white rounded-[10px] pointer-events-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
      >
        <Icon material="account_circle" size="28px" class="color-black"></Icon>
      </Button>
    </div>
  </div>
</Page>

<style lang="postcss">
  :global(.map) {
    height: 100vh;
  }
</style>
