import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import { supabase } from "../../../lib/supabase";

import type { Owner } from "../../owners/model/types";
import type { OwnerRow } from "../../owners/model/dbTypes";

import type { Sound } from "../model/types";
import type { SoundRow } from "../model/dbTypes";
import type { SoundFormPayload } from "../model/formTypes";

import {
  mapOwner,
  mapSound,
  mapSoundPayloadToRow,
} from "../model/mappers";

interface UpdateSoundArgs {
  readonly id: string;
  readonly payload: SoundFormPayload;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const throwIfSupabaseError = (error: { message: string } | null) => {
  if (error) {
    throw new Error(error.message);
  }
};

export const adminApiSlice = createApi({
  reducerPath: "adminApi",

  baseQuery: fakeBaseQuery(),

  tagTypes: ["Sounds", "Owners"],

  endpoints: builder => ({
    getOwners: builder.query<Owner[], void>({
      async queryFn() {
        try {
          const { data, error } = await supabase
            .from("owners")
            .select("*")
            .order("created_at", { ascending: true });

          throwIfSupabaseError(error);

          return {
            data: (data ?? []).map(row => mapOwner(row as OwnerRow)),
          };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Failed to load owners"),
          };
        }
      },

      providesTags: ["Owners"],
    }),

    getSounds: builder.query<Sound[], void>({
      async queryFn() {
        try {
          const { data, error } = await supabase
            .from("sounds")
            .select("*")
            .order("created_at", { ascending: false });

          throwIfSupabaseError(error);

          return {
            data: (data ?? []).map(row => mapSound(row as SoundRow)),
          };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Failed to load sounds"),
          };
        }
      },

      providesTags: result =>
        result
          ? [
              { type: "Sounds", id: "LIST" },
              ...result.map(sound => ({
                type: "Sounds" as const,
                id: sound.id,
              })),
            ]
          : [{ type: "Sounds", id: "LIST" }],
    }),

    getSoundById: builder.query<Sound, string>({
      async queryFn(id) {
        try {
          const { data, error } = await supabase
            .from("sounds")
            .select("*")
            .eq("id", id)
            .single();

          throwIfSupabaseError(error);

          return {
            data: mapSound(data as SoundRow),
          };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Failed to load sound"),
          };
        }
      },

      providesTags: (_result, _error, id) => [
        {
          type: "Sounds",
          id,
        },
      ],
    }),

    createSound: builder.mutation<Sound, SoundFormPayload>({
      async queryFn(payload) {
        try {
          const { data, error } = await supabase
            .from("sounds")
            .insert(
              mapSoundPayloadToRow(payload, {
                includeDialCode: true,
              })
            )
            .select()
            .single();

          throwIfSupabaseError(error);

          return {
            data: mapSound(data as SoundRow),
          };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Failed to create sound"),
          };
        }
      },

      invalidatesTags: [
        {
          type: "Sounds",
          id: "LIST",
        },
      ],
    }),

    updateSound: builder.mutation<Sound, UpdateSoundArgs>({
      async queryFn({ id, payload }) {
        try {
          const { data, error } = await supabase
            .from("sounds")
            .update(mapSoundPayloadToRow(payload))
            .eq("id", id)
            .select()
            .single();

          throwIfSupabaseError(error);

          return {
            data: mapSound(data as SoundRow),
          };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Failed to update sound"),
          };
        }
      },

      invalidatesTags: (_result, _error, arg) => [
        {
          type: "Sounds",
          id: arg.id,
        },
        {
          type: "Sounds",
          id: "LIST",
        },
      ],
    }),

    deleteSound: builder.mutation<string, string>({
      async queryFn(id) {
        try {
          const { error } = await supabase
            .from("sounds")
            .delete()
            .eq("id", id);

          throwIfSupabaseError(error);

          return {
            data: id,
          };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Failed to delete sound"),
          };
        }
      },

      invalidatesTags: (_result, _error, id) => [
        {
          type: "Sounds",
          id,
        },
        {
          type: "Sounds",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetOwnersQuery,
  useGetSoundsQuery,
  useGetSoundByIdQuery,
  useCreateSoundMutation,
  useUpdateSoundMutation,
  useDeleteSoundMutation,
} = adminApiSlice;