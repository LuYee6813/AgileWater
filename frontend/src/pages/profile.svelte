<script lang="ts">
  import { Sheet, Icon } from "framework7-svelte";
  import type { UserData } from "../api/common";

  export let userData: UserData | null = null;

  export let ProfileSheetOpened = false;
</script>

<Sheet
  style="height: 40vh"
  swipeToClose
  swipeToStep
  closeByOutsideClick
  closeOnEscape
  push
  backdrop={false}
  class="shadow-2xl shadow-black bg-white h-full"
  bind:opened={ProfileSheetOpened}
>
  <div class="swipe-handler"></div>

  <div class="page-content">
    <div class="w-full h-full flex flex-col justify-center items-center gap-2">
      <div
        class=" bg-[#E6E6E6] w-[200px] h-[200px] border border-black flex items-center justify-center rounded-full"
      >
        <Icon material="person" size={150} />
      </div>
      <div class="flex flex-col items-center">
        <span class="text-[35px] font-bold">{userData?.username}</span>
        <span class="text-[15px] font-bold">({userData?.nickname})</span>
      </div>
    </div>
  </div>
</Sheet>

<style lang="postcss">
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
    margin-left: -25px;
    margin-top: -3px;
    border-radius: 3px;
    background: #000000;
  }
</style>
