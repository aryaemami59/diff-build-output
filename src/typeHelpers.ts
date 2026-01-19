/**
 * Omits keys from a type, **distributing** the operation over a union.
 * TypeScript's {@linkcode Omit} does **not** distribute over unions,
 * which can lead to the erasure of unique properties from union members
 * when omitting keys. This causes the resulting type to retain only
 * properties common to all union members, making it impossible to access
 * member-specific properties after using {@linkcode Omit}.
 * In other words, using {@linkcode Omit} on a union merges its members into
 * a less specific type, breaking type narrowing and property access based
 * on discriminants. This utility solves that limitation by applying
 * {@linkcode Omit} distributively to each union member.
 *
 * @example
 * <caption>Demonstrating `Omit` vs `DistributedOmit`</caption>
 *
 * ```ts
 * type A = {
 *   discriminant: 'A';
 *   foo: string;
 *   a: number;
 * };
 *
 * type B = {
 *   discriminant: 'B';
 *   foo: string;
 *   b: string;
 * };
 *
 * type Union = A | B;
 *
 * type OmittedUnion = Omit<Union, 'foo'>;
 * // => { discriminant: 'A' | 'B' }
 *
 * const omittedUnion: OmittedUnion = createOmittedUnion();
 *
 * if (omittedUnion.discriminant === 'A') {
 *   // We would like to narrow `omittedUnion`'s type to `A` here,
 *   // but we can't because `Omit` doesn't distribute over unions.
 *
 *   omittedUnion.a;
 *   // => Error: Property 'a' does not exist on type '{ discriminant: "A" | "B" }'
 * }
 * ```
 *
 * @template ObjectType - The base object or union type to omit properties from.
 * @template KeyType - The keys of {@linkcode ObjectType} to omit.
 */
export type DistributedOmit<
  ObjectType,
  KeyType extends keyof ObjectType,
> = ObjectType extends unknown ? Omit<ObjectType, KeyType> : never

/**
 * Picks keys from a type, **distributing** the operation over a union.
 * TypeScript's {@linkcode Pick} does **not** distribute over unions,
 * which can lead to the erasure of unique properties from union members
 * when picking keys. This causes the resulting type to retain only
 * properties common to all union members, making it impossible to access
 * member-specific properties after using {@linkcode Pick}.
 * In other words, using {@linkcode Pick} on a union merges its members into
 * a less specific type, breaking type narrowing and property access based
 * on discriminants. This utility solves that limitation by applying
 * {@linkcode Pick} distributively to each union member.
 *
 * @example
 * <caption>Demonstrating `Pick` vs `DistributedPick`</caption>
 *
 * ```ts
 * type A = {
 *   discriminant: 'A';
 *   foo: {
 *     bar: string;
 *   };
 *   extraneous: boolean;
 * };
 *
 * type B = {
 *   discriminant: 'B';
 *   foo: {
 *     baz: string;
 *   };
 *   extraneous: boolean;
 * };
 *
 * // Notice that `foo.bar` exists in `A` but not in `B`.
 *
 * type Union = A | B;
 *
 * type PickedUnion = DistributedPick<Union, 'discriminant' | 'foo'>;
 *
 * declare const pickedUnion: PickedUnion;
 *
 * if (pickedUnion.discriminant === 'A') {
 *   pickedUnion.foo.bar;
 *    //=> OK
 *
 *   // @ts-expect-error
 *   pickedUnion.extraneous;
 *   //=> Error: Property `extraneous` does not exist on type `Pick<A, 'discriminant' | 'foo'>`.
 *
 *   // @ts-expect-error
 *   pickedUnion.foo.baz;
 *   //=> Error: `bar` is not a property of `{discriminant: 'A'; a: string}`.
 * }
 * ```
 *
 * @template ObjectType - The base object or union type to pick properties from.
 * @template KeyType - The keys of {@linkcode ObjectType} to pick.
 */
export type DistributedPick<
  ObjectType,
  KeyType extends keyof ObjectType,
> = ObjectType extends unknown ? Pick<ObjectType, KeyType> : never

/**
 * An alias for type **`{}`**. Represents any value that is not
 * **`null`** or **`undefined`**. It is mostly used for semantic purposes to
 * help distinguish between an empty object type and **`{}`**
 * as they are not the same.
 */
export type AnyNonNullishValue = NonNullable<unknown>

/**
 * Useful to flatten the type output to improve type hints shown in editors.
 * And also to transform an interface into a type to aide with assignability.
 *
 * @example
 * <caption>Basic usage</caption>
 *
 * ```ts
 * interface SomeInterface {
 *   foo: number;
 *   bar?: string;
 *   baz: number | undefined;
 * }
 *
 * type SomeType = {
 *   foo: number;
 *   bar?: string;
 *   baz: number | undefined;
 * };
 *
 * const literal = { foo: 123, bar: 'hello', baz: 456 };
 * const someType: SomeType = literal;
 * const someInterface: SomeInterface = literal;
 *
 * declare function fn(object: Record<string, unknown>): void;
 *
 * fn(literal); // Good: literal object type is sealed
 * fn(someType); // Good: type is sealed
 * // @ts-expect-error
 * fn(someInterface); // Error: Index signature for type 'string' is missing in type 'someInterface'. Because `interface` can be re-opened
 * fn(someInterface as Simplify<SomeInterface>); // Good: transform an `interface` into a `type`
 * ```
 *
 * @template BaseType - The type to simplify.
 *
 * @see {@link https://github.com/sindresorhus/type-fest/blob/2300245cb6f0b28ee36c2bb852ade872254073b8/source/simplify.d.ts Source}
 * @see {@link https://github.com/microsoft/TypeScript/issues/15300 | TypeScript Issue}
 */
export type Simplify<BaseType> = BaseType extends
  | ((...args: never[]) => unknown)
  | (abstract new (...args: never[]) => unknown)
  | (new (...args: never[]) => unknown)
  ? BaseType
  : AnyNonNullishValue & {
      [KeyType in keyof BaseType]: BaseType[KeyType]
    }

export type SetOptional<
  BaseType,
  Keys extends keyof BaseType,
> = (BaseType extends (...arguments_: never) => unknown
  ? (...arguments_: Parameters<BaseType>) => ReturnType<BaseType>
  : unknown) &
  BaseType extends unknown // To distribute `BaseType` when it's a union type.
  ? Simplify<
      // Pick just the keys that are readonly from the base type.
      Omit<BaseType, Keys> &
        // Pick the keys that should be mutable from the base type and make them mutable.
        Partial<{
          [P in keyof BaseType as Extract<P, Keys>]: BaseType[P]
        }>
    >
  : never

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | LiteralType
  | (BaseType & Record<never, never>)

export type LiteralStringUnion<LiteralType, BaseType extends string = string> =
  | LiteralType
  | (BaseType & Record<never, never>)
