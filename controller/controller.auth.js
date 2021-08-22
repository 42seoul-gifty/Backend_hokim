const axios = require("axios");
var querystring = require("querystring");
const { kako_config, domain, naver_config } = require("../config/config");

const { User } = require("../models");
const { findOrCreate } = require("../lib/lib.User");

const redirectKakao = async (req, res) => {
  res.redirect(
    `https://kauth.kakao.com/oauth/authorize?client_id=${kako_config.rest_key}&redirect_uri=${process.env.SITE_DOMAIN}/login/kakao/callback&response_type=code`
  );
};

const redirectNaver = async (req, res) => {
  res.redirect(
    `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naver_config.client_id}&redirect_uri=${process.env.SITE_DOMAIN}/login/naver/callback`
  );
};

const getKakaoToken = async (req, res) => {
  try {
    //코드로 토큰 받아오기
    const result = await axios({
      method: "post",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify({
        grant_type: "authorization_code",
        client_id: `${kako_config.rest_key}`,
        redirect_uri: `${domain}/login/kakao/callback`,
        code: req.query.code,
        client_secret: `${kako_config.secret}`,
      }),
    });

    //엑세스 토큰으로 사용자 정보 불러오기
    const kakaoUser = await axios({
      method: "get",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        Authorization: `Bearer ${result.data.access_token}`,
      },
    });

    const user = await findOrCreate(
      userData.email,
      userData.profile.nickname,
      "kakao",
      result.data.access_token
    );
    //console.log(user.get({ plain: true }));
  } catch (e) {
    console.log(e);
    res.render("result", { success: "로그인 실패" });
    return;
  }
  res.render("result", { success: "로그인 성공" });
};

const getNaverToken = async (req, res) => {
  try {
    code = req.query.code;
    state = req.query.state;
    api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naver_config.client_id}&client_secret=${naver_config.secret}&redirect_uri==${process.env.SITE_DOMAIN}/login/naver/callback&code=${code}&state=${state}`;

    const result = await axios({
      method: "get",
      url: api_url,
      headers: {
        "X-Naver-Client-Id": naver_config.client_id,
        "X-Naver-Client-Secret": naver_config.secret,
      },
    });

    //엑세스 토큰으로 사용자 정보 불러오기
    const naverUser = await axios({
      method: "get",
      url: "https://openapi.naver.com/v1/nid/me",
      headers: {
        Authorization: `${result.data.token_type} ${result.data.access_token}`,
      },
    });
    console.log(naverUser.data.response.email);
    const user = await findOrCreate(
      naverUser.data.response.email,
      naverUser.data.response.nickname,
      "naver",
      result.data.access_token
    );

    console.log(user);
  } catch (e) {
    console.log(e);
    res.render("result", { success: "로그인 실패" });
    return;
  }

  res.render("result", { success: "로그인 성공" });
};

const kakaoLogout = async (req, res) => {
  try {
    //카카오 로그아웃
    await axios({
      method: "post",
      url: "https://kapi.kakao.com/v1/user/logout",
      headers: {
        Authorization: `Bearer ${req.body.access_token}`,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({ success: false });
    return;
  }
  res.json({ success: true });
};

const naverLogout = async (req, res) => {
  try {
    //네이버 로그아웃
    await axios({
      method: "post",
      url: `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${naver_config.client_id}&client_secret=${naver_config.secret}&access_token=${req.body.access_token}&service_provider=NAVER`,
    });
  } catch (e) {
    console.log(e);
    res.json({ success: false });
    return;
  }
  res.json({ success: true });
};

module.exports = {
  redirectKakao,
  getKakaoToken,
  kakaoLogout,
  redirectNaver,
  getNaverToken,
  naverLogout,
};
