import { createSlice } from '@reduxjs/toolkit';

import type { SiteData } from '../../types/state';
import type { OfferPreview } from '../../types/types';
import { StoreSlice, SubmitStatus } from '../../const';
import { fetchOffers, fetchOffer, fetchPremiumOffers, fetchComments, postComment, postFavorite, deleteFavorite, fetchFavoriteOffers, postOffer, editOffer } from '../action';

const initialState: SiteData = {
  offers: [],
  isOffersLoading: false,
  offer: null,
  isOfferLoading: false,
  favoriteOffers: [],
  isFavoriteOffersLoading: false,
  premiumOffers: [],
  comments: [],
  commentStatus: SubmitStatus.Still,
};

export const siteData = createSlice({
  name: StoreSlice.SiteData,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.isOffersLoading = true;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = action.payload;
        state.isOffersLoading = false;
      })
      .addCase(fetchOffers.rejected, (state) => {
        state.isOffersLoading = false;
      })
      .addCase(fetchFavoriteOffers.pending, (state) => {
        state.isFavoriteOffersLoading = true;
      })
      .addCase(fetchFavoriteOffers.fulfilled, (state, action) => {
        state.favoriteOffers = action.payload;
        state.isFavoriteOffersLoading = false;
      })
      .addCase(fetchFavoriteOffers.rejected, (state) => {
        state.isFavoriteOffersLoading = false;
      })
      .addCase(fetchOffer.pending, (state) => {
        state.isOfferLoading = true;
      })
      .addCase(fetchOffer.fulfilled, (state, action) => {
        state.offer = action.payload;
        state.isOfferLoading = false;
      })
      .addCase(fetchOffer.rejected, (state) => {
        state.isOfferLoading = false;
      })
      .addCase(postOffer.fulfilled, (state, action) => {
        state.offers.push({
          ...action.payload,
          cityName: action.payload.city.name
        });
      })
      .addCase(editOffer.fulfilled, (state, action) => {
        const updatedOffer = action.payload;
        state.offers = state.offers.map((offer) => offer.id === updatedOffer.id
          ? { ...updatedOffer, cityName: updatedOffer.city.name }
          : offer
        );
        state.favoriteOffers = state.favoriteOffers.map((offer) => offer.id === updatedOffer.id
          ? { ...updatedOffer, cityName: updatedOffer.city.name }
          : offer
        );
        state.premiumOffers = state.premiumOffers.map((offer) => offer.id === updatedOffer.id
          ? { ...updatedOffer, cityName: updatedOffer.city.name }
          : offer
        );
      })
      .addCase(fetchPremiumOffers.fulfilled, (state, action) => {
        state.premiumOffers = action.payload;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(postComment.pending, (state) => {
        state.commentStatus = SubmitStatus.Pending;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        state.commentStatus = SubmitStatus.Fullfilled;
      })
      .addCase(postComment.rejected, (state) => {
        state.commentStatus = SubmitStatus.Rejected;
      })
      .addCase(postFavorite.fulfilled, (state, action) => {
        const offerId = action.payload;
        const markFavorite = (offer: OfferPreview) =>
          offer.id === offerId ? { ...offer, isFavorite: true } : offer;

        state.offers = state.offers.map(markFavorite);
        state.premiumOffers = state.premiumOffers.map(markFavorite);

        const preview = state.offers.find((offer) => offer.id === offerId)
          ?? state.premiumOffers.find((offer) => offer.id === offerId);

        if (preview && !state.favoriteOffers.some((offer) => offer.id === offerId)) {
          state.favoriteOffers.push({ ...preview, isFavorite: true });
        }

        if (state.offer?.id === offerId) {
          state.offer = { ...state.offer, isFavorite: true };
        }
      })
      .addCase(deleteFavorite.fulfilled, (state, action) => {
        const offerId = action.payload;
        const unmarkFavorite = (offer: OfferPreview) =>
          offer.id === offerId ? { ...offer, isFavorite: false } : offer;

        state.offers = state.offers.map(unmarkFavorite);
        state.premiumOffers = state.premiumOffers.map(unmarkFavorite);
        state.favoriteOffers = state.favoriteOffers.filter((offer) => offer.id !== offerId);

        if (state.offer?.id === offerId) {
          state.offer = { ...state.offer, isFavorite: false };
        }
      });
  }
});
