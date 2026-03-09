import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let drinkIdLength = 6;
  type DrinkEntry = {
    amountMl : Nat;
    timestamp : Int;
  };

  type DrinkEntryView = {
    id : Text;
    amountMl : Nat;
    timestamp : Int;
  };

  type IntKey = Int;

  module DrinkEntry {
    public func fromView(drinkView : DrinkEntryView) : DrinkEntry {
      {
        amountMl = drinkView.amountMl;
        timestamp = drinkView.timestamp;
      };
    };
  };

  // Persistent storage for entries and goals
  let entries = Map.empty<Principal, Map.Map<IntKey, DrinkEntry>>();
  let drinkEntriesOriginal = Map.empty<Principal, List.List<DrinkEntry>>();
  let dailyGoals = Map.empty<Principal, Nat>();
  let entryCounters = Map.empty<Principal, Int>();

  func now() : Int {
    Time.now();
  };

  func getDayFromTime(time : Int) : Int {
    time / (24 * 60 * 60 * 1000000000);
  };

  func getToday() : Int {
    getDayFromTime(now());
  };

  // Helper to convert DrinkEntry to DrinkEntryView
  func toDrinkEntryView(id : Int, entry : DrinkEntry) : DrinkEntryView {
    {
      id = id.toText();
      amountMl = entry.amountMl;
      timestamp = entry.timestamp;
    };
  };

  public shared ({ caller }) func addEntry(amountMl : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add entries");
    };

    if (amountMl == 0) {
      Runtime.trap("Amount must be greater than 0");
    };

    let timestamp = now();

    // Get current counter for unique id
    let entryId = switch (entryCounters.get(caller)) {
      case (?count) { count };
      case (null) { 0 };
    };

    let entry = { amountMl; timestamp };

    // Add entry to entries
    let userEntries = switch (entries.get(caller)) {
      case (?entries) { entries };
      case (null) { Map.empty<IntKey, DrinkEntry>() };
    };
    userEntries.add(entryId, entry);
    entries.add(caller, userEntries);

    entryCounters.add(caller, entryId + 1);

    // Also add to drinkEntriesOriginal
    let userOriginal = switch (drinkEntriesOriginal.get(caller)) {
      case (?entries) { entries };
      case (null) { List.empty<DrinkEntry>() };
    };

    userOriginal.add(entry);
    drinkEntriesOriginal.add(caller, userOriginal);
  };

  public query ({ caller }) func getTodayEntries() : async [DrinkEntryView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view entries");
    };

    switch (entries.get(caller)) {
      case (null) { [] };
      case (?entriesMap) {
        switch (entriesMap.size()) {
          case (0) { [] };
          case (_) {
            let iter = entriesMap.entries();
            let entryIter = iter.map(
              func((id, entry)) { toDrinkEntryView(id, entry) }
            );
            entryIter.toArray();
          };
        };
      };
    };
  };

  public query ({ caller }) func getEntriesOriginal() : async [DrinkEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view entries");
    };

    switch (drinkEntriesOriginal.get(caller)) {
      case (null) { [] };
      case (?entriesList) { entriesList.toArray() };
    };
  };

  public query ({ caller }) func getGoal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };

    switch (dailyGoals.get(caller)) {
      case (null) { 2000 };
      case (?goal) { goal };
    };
  };

  public shared ({ caller }) func setGoal(goal : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set goals");
    };

    if (goal <= 0) {
      Runtime.trap("Goal must be greater than 0");
    };
    dailyGoals.add(caller, goal);
  };

  public shared ({ caller }) func clearTodayEntries() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear entries");
    };

    entries.remove(caller);
    drinkEntriesOriginal.remove(caller);
    entryCounters.remove(caller);
  };

  // Authorization system required by core library
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
