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
  import { login } from "../api/auth/auth";

  let username = "";
  let password = "";

  const signIn = async () => {
    const loginsucess = await login(username, password);
    console.log("login state", loginsucess);
    if (loginsucess) {
      f7.views.main.router.navigate("/");
    } else {
      f7.dialog.alert("帳號密碼無效");
    }
  };
</script>

<Page loginScreen class="px-5">
  <div class="mb-80">
    <LoginScreenTitle
      >Agile Water帳戶
      <br />
      <span class="text-sm font-normal"
        >以Agile Water帳戶登入來使用Agile Water的相關服務</span
      >
    </LoginScreenTitle>
    <List form>
      <ListInput
        class="mb-5 bg-slate-200 rounded-xl"
        type="text"
        placeholder="Username"
        value={username}
        onInput={(e) => (username = e.target.value)}
      />
      <ListInput
        class=" bg-slate-200 rounded-xl"
        type="password"
        placeholder="Password"
        value={password}
        onInput={(e) => (password = e.target.value)}
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
        >登入</ListButton
      >
      <div class="flex flex-row items-center justify-center">
        <span>如果您沒有帳戶</span>
        <ListButton href="/register/" title="前往註冊" />
      </div>
    </List>
  </BlockFooter>
</Page>
