import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile System
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Text Sections
  type TextSection = {
    key : Text;
    content : Text;
  };

  let textSections = Map.empty<Text, TextSection>();

  public shared ({ caller }) func updateSection(key : Text, content : Text) : async () {
    guardLoggedIn(caller);
    let section : TextSection = { key; content };
    textSections.add(key, section);
  };

  public query ({ caller }) func getSection(key : Text) : async ?TextSection {
    textSections.get(key);
  };

  public query ({ caller }) func getAllSections() : async [TextSection] {
    textSections.values().toArray();
  };

  public shared ({ caller }) func initializeDefaultSections() : async () {
    let defaultSections : [(Text, Text)] = [
      ("title", "Ella & Roman"),
      ("subtitle", "Liebe, Berge & Geschichten"),
      ("date_label", "7. – 9. August 2026"),
      ("countdown_label", "Noch bis zur Hochzeit"),
      ("willkommen", "Wir freuen uns riesig, unsere Hochzeit mit Dir zu feiern! Unser groesster Wunsch ist es, etwas mehr Zeit mit Dir verbringen zu duerfen. Unser Fest findet deshalb an 2.5 Tagen statt und soll gemutlich - spannend - legendaer werden."),
      ("location", "Wir haben uns fuer eine naturnahe Hochzeit in den Glarner Bergen am Fuss vom Fronalpstock entschieden. Das Fest findet im Stockhus und im Naturfreundehaus Fronalp statt."),
      ("anreise", "Die Strasse zur Fronalp ist sehr kurvig, steil und eng. Aus diesem Grund stellen wir ein Shuttle-Taxi ab dem Bahnhof Ziegelbruecke zur Verfuegung."),
      ("programm_intro", "Die wichtigsten Programmpunkte - Details folgen zu einem spaeten Zeitpunkt."),
      ("workshops", "Unsere Workshops laden Dich ein, auszuprobieren, was wir in der Freizeit gerne machen und gemeinsam etwas zu gestalten."),
      ("uebernachtung", "Unser grosser Wunsch ist es, moeglichst viel Zeit mit Dir an diesem traumhaften Ort zu verbringen. Deshalb sind fuer beide Naechte genuegend Schlafmoeglichkeiten vorhanden."),
      ("kleidung", "Hauptfest am Samstagnachmittag ab 16:30 Uhr: Festlich - elegant, aber nicht zu extravagant, wir sind in den Bergen."),
      ("beitraege", "Wir wuenschen uns ein gemuetliches Wochenende mit einer ungezwungenen Atmosphaere und genuegend Raum fuer gute Gespraeche."),
      ("anmeldung", "Bitte melde Dich bis am xx.xx.2026 ueber folgenden Link / QR-Code an. Wir bitten Paare, das Formular pro Person individuell auszufuellen."),
    ];

    for ((key, content) in defaultSections.values()) {
      if (textSections.get(key) == null) {
        let section : TextSection = { key; content };
        textSections.add(key, section);
      };
    };
  };

  // Image Sections
  let images = Map.empty<Text, Storage.ExternalBlob>();

  public shared ({ caller }) func updateSectionImage(key : Text, image : Storage.ExternalBlob) : async () {
    guardLoggedIn(caller);
    images.add(key, image);
  };

  public query ({ caller }) func getSectionImage(key : Text) : async ?Storage.ExternalBlob {
    images.get(key);
  };

  public query ({ caller }) func getAllSectionImages() : async [(Text, Storage.ExternalBlob)] {
    images.toArray();
  };

  // Color Settings
  public type ColorSettings = {
    bgColor : Text;
    titleColor : Text;
    subtitleColor : Text;
    heartColor : Text;
    accentColor : Text;
    navTextColor : Text;
  };

  stable var colorSettings : ColorSettings = {
    bgColor = "#84b8ad";
    titleColor = "#e8609a";
    subtitleColor = "#a02060";
    heartColor = "#e8609a";
    accentColor = "#1a3d25";
    navTextColor = "#1a3d25";
  };

  public query ({ caller }) func getColorSettings() : async ColorSettings {
    colorSettings;
  };

  public shared ({ caller }) func updateColorSettings(settings : ColorSettings) : async () {
    guardLoggedIn(caller);
    colorSettings := settings;
  };

  // Helper: require caller to be logged in (not anonymous)
  func guardLoggedIn(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please log in first.");
    };
  };
};
