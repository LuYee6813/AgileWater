<script lang="ts">
  import { Button, Icon, Page } from "framework7-svelte";
  import { onDestroy, onMount, tick } from "svelte";
  import { MapLibre, Marker } from "svelte-maplibre";
  import type { LngLatLike } from "svelte-maplibre/dist/types";
  import PinDetailsSheet from "../components/PinDetailsSheet.svelte";
  import { getWaterDispensers } from "../api/waterDispenser/waterDispenser";

  import type {
    WaterDispenserResponse,
    WaterDispenserParams,
  } from "../api/common";

  let markers: WaterDispenserResponse[] = [];

  let map: maplibregl.Map | null = null;

  let center: LngLatLike = [121.5635931, 25.0334858];
  let zoom = 16;

  let sheetOpened = false;
  let sheetClosing = false;

  let focusPin: WaterDispenserResponse | null = null;
  let userPin: LngLatLike = null;

  let sheetView: HTMLElement | null = null;

  async function handleMarkerClick(pin: WaterDispenserResponse) {
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
        center: pin.location,
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
        center: lastFocusPin.location,
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

  function calculateRadius(bounds) {
    // 獲取南西角和北東角座標
    const southwest = bounds.getSouthWest();
    const northeast = bounds.getNorthEast();

    // 計算中心點
    const center = {
      lng: (southwest.lng + northeast.lng) / 2,
      lat: (southwest.lat + northeast.lat) / 2,
    };

    // 計算半徑（取中心點到任意一角的距離）
    const radius = calculateDistance(center, northeast);

    return radius;
  }

  // 計算兩點之間的距離（Haversine公式）
  function calculateDistance(point1, point2) {
    const R = 6371; // 地球半徑（公里）
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 返回距離（公尺）
  }

  async function handleMapMove() {
    if (map) {
      map.on("moveend", async () => {
        const currentCenter = map.getCenter();
        const radius = calculateRadius(map.getBounds());
        console.log("radius:", radius);
        console.log("地圖中心移動到:", currentCenter);

        try {
          // 構造參數，傳遞當前經緯度和搜尋半徑
          const params: WaterDispenserParams = {
            lat: currentCenter.lat,
            lng: currentCenter.lng,
            radius: radius, // 預設半徑為 5000 公尺
            limit: -1, // 每次最多獲取 20 筆資料
            sort: "distance", // 按距離排序
          };

          const dispensers = await getWaterDispensers(params);
          console.log("飲水機資料:", dispensers);

          // 更新 markers
          markers = dispensers.map((dispenser: WaterDispenserResponse) => ({
            sn: dispenser.sn,
            type: dispenser.type,
            location: dispenser.location,
            name: dispenser.name,
            addr: dispenser.addr,
            iced: dispenser.iced,
            cold: dispenser.cold,
            warm: dispenser.warm,
            hot: dispenser.hot,
            openingHours: dispenser.openingHours,
            description: dispenser.description,
            rate: dispenser.rate,
            photos: dispenser.photos,
            path: dispenser.path,
            reviews: dispenser.reviews,
            distance: dispenser.distance,
          }));
        } catch (error) {
          console.error("無法獲取飲水機資料:", error);
        }
      });
    } else {
      console.error("地圖未初始化。");
    }
  }

  onMount(async () => {
    await tick();
    if (map && !sheetOpened) {
      map.on("load", () => {
        console.log("地圖已載入");
        if (!sheetOpened) {
          handleMapMove();
        }
      });
    } else {
      console.error("地圖未初始化qwq");
    }
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
  <div
    class="flex flex-row justify-center w-full pt-14 fixed top-0 z-10 pointer-events-none"
  >
    <div class="w-full flex flex-row justify-between items-center px-[14px]">
      <div
        style="font-size: 48px; width: 80%; white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis;"
        class="w-[80%] h-[70px] font-sans text-xl flex items-center"
      >
        {#if focusPin?.name}
          <span class="underline font-bold">{focusPin.name}</span>
        {:else}
          <span class="font-bold">沒事多喝水</span>
        {/if}
      </div>
      <Button
        outline
        class="w-[44px] h-[44px] border-[2px] border-black rounded-[10px] pointer-events-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
      >
        <Icon material="settings" size={24} class="color-black"></Icon>
      </Button>
    </div>
  </div>
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
      {p === focusPin && !sheetClosing
          ? ''
          : 'h-[0.75rem] w-[0.75rem] bg-black'}"
        lngLat={p.location}
        on:click={() => handleMarkerClick(p)}
      >
        {#if p === focusPin && !sheetClosing}
          {console.log(true)}
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
    class="flex flex-row justify-center w-full pb-10 fixed bottom-0 z-5 pointer-events-none"
  >
    <div class="w-full flex flex-row justify-between px-[40px]">
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
