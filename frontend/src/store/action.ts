import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserAuth, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer, OfferPreview, CityName } from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';
import { adaptCreateCommentToServer, adaptCreateOfferToServer, adaptUpdateOfferToServer } from '../adaptersToServer';
import { OfferPreviewRdo } from '../dto/offer/offer-preview.rdo';
import { adaptCommentToClient, adaptOfferPreviewToClient, adaptOfferToClient } from '../adaptersToClient';
import { OfferRdo } from '../dto/offer/offer.dto';
import { LoggedUserRdo, UserRdo } from '../dto/user/user.dto';
import { CommentRdo } from '../dto/comment/comment.dto';

type Extra = {
  api: AxiosInstance;
  history: History;
};

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  DELETE_FAVORITE: 'offer/delete-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register',
};

export const fetchOffers = createAsyncThunk<OfferPreview[], CityName | undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<OfferPreviewRdo[]>(ApiRoute.Offers, {
      params: cityName ? { city: cityName } : undefined,
    });

    return data.map((item) => adaptOfferPreviewToClient(item));
  });

export const fetchFavoriteOffers = createAsyncThunk<OfferPreview[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<OfferPreviewRdo[]>(ApiRoute.Favorites);

    return data.map((item) => adaptOfferPreviewToClient(item));
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<OfferRdo>(`${ApiRoute.Offers}/${id}`);

      return adaptOfferToClient(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<Offer, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<OfferRdo>(ApiRoute.Offers, adaptCreateOfferToServer(newOffer));
    history.push(`${AppRoute.Property}/${data.id}`);

    return adaptOfferToClient(data);
  });

export const editOffer = createAsyncThunk<Offer, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.patch<OfferRdo>(`${ApiRoute.Offers}/${offer.id}`, adaptUpdateOfferToServer(offer));
    history.push(`${AppRoute.Property}/${data.id}`);

    return adaptOfferToClient(data);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<OfferPreview[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<OfferPreviewRdo[]>(ApiRoute.Premium, {
      params: { city: cityName },
    });

    return data.map((item) => adaptOfferPreviewToClient(item));
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<CommentRdo[]>(`${ApiRoute.Offers}/${id}${ApiRoute.Comments}`);

    return data.map((item, index) => adaptCommentToClient(item, index));
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra, dispatch }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<UserRdo>(ApiRoute.UserStatus);

      dispatch(fetchFavoriteOffers());

      return data.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.post<LoggedUserRdo>(ApiRoute.Login, { email, password });
    const { token } = data;

    Token.save(token);
    dispatch(fetchFavoriteOffers());
    history.push(AppRoute.Root);

    return email;
  });

export const logoutUser = createAsyncThunk(
  Action.LOGOUT_USER,
  async () => Token.drop()
);

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, avatar, isPro }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<UserRdo>(ApiRoute.Register, {
      email,
      password,
      name,
      type: isPro ? 'pro' : 'default',
    });
    if (avatar) {
      const payload = new FormData();
      payload.append('avatar', avatar);
      await api.post(ApiRoute.Avatar.replace(':userId', data.id), payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    history.push(AppRoute.Login);
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<CommentRdo>(`${ApiRoute.Offers}/${id}${ApiRoute.Comments}`, adaptCreateCommentToServer({ comment, rating }));

    return adaptCommentToClient(data, Date.now());
  });

export const postFavorite = createAsyncThunk<
  Offer['id'],
  FavoriteAuth,
  { extra: Extra }
>(Action.POST_FAVORITE, async (id, { extra }) => {
  const { api, history } = extra;

  try {
    await api.post(`${ApiRoute.Favorites}/${id}`);

    return id;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === HttpCode.NoAuth) {
      history.push(AppRoute.Login);
    }

    return Promise.reject(error);
  }
});

export const deleteFavorite = createAsyncThunk<
  Offer['id'],
  FavoriteAuth,
  { extra: Extra }
>(Action.DELETE_FAVORITE, async (id, { extra }) => {
  const { api, history } = extra;

  try {
    await api.delete(`${ApiRoute.Favorites}/${id}`);

    return id;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === HttpCode.NoAuth) {
      history.push(AppRoute.Login);
    }

    return Promise.reject(error);
  }
});
