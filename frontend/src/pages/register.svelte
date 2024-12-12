<script>
  import {
    f7,
    Page,
    ListInput,
    List,
    LoginScreenTitle,
    BlockFooter,
    ListButton,
  } from "framework7-svelte";
  import { register } from "../api/auth/auth";

  let username = "";
  let password = "";
  let nickname = "";

  const signIn = async () => {
    const loginsucess = await register(username, password, nickname);
    console.log("login state", loginsucess);
    if (loginsucess) {
      f7.views.main.router.navigate("/login");
    } else {
      f7.dialog.alert("帳號密碼無效");
    }
  };
</script>

<Page loginScreen class="px-5">
  <div class="mb-80">
    <LoginScreenTitle
      >Agile Water註冊
      <br />
      <span class="text-sm font-normal"
        >註冊Agile Water以獲得Agile Water的相關服務</span
      >
    </LoginScreenTitle>
    <List form>
      <ListInput
        class="mb-5 bg-slate-200 rounded-xl"
        type="text"
        placeholder="Your username"
        value={username}
        onInput={(e) => (username = e.target.value)}
      />
      <ListInput
        class="mb-5 bg-slate-200 rounded-xl"
        type="password"
        placeholder="Your password"
        value={password}
        onInput={(e) => (password = e.target.value)}
      />
      <ListInput
        class=" bg-slate-200 rounded-xl"
        type="text"
        placeholder="Nickname"
        value={nickname}
        onInput={(e) => (nickname = e.target.value)}
      />
    </List>
  </div>

  <BlockFooter>
    <span class="text-[10px] flex flex-row items-center justify-center gap-2">
      你的「Agile Water帳戶」資訊會在你登入時用來啟用Agile
      Water服務，讓你在需要更換或回復裝置時使用。我們可會使用您的裝置序號來檢查服務的使用資料格。</span
    >
    <List inset class="w-full flex flex-col">
      <ListButton class="bg-slate-200 rounded-xl" onClick={signIn}
        >註冊</ListButton
      >
      <div class="flex flex-row items-center justify-center">
        <span>已有帳戶？</span>
        <ListButton href="/login/" title="前往登入" />
      </div>
    </List>
  </BlockFooter>
</Page>
