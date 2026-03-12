import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Section = {
    key : Text;
    content : Text;
  };

  let sections = Map.empty<Text, Section>();

  public shared ({ caller }) func updateSection(key : Text, content : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized Access: Only admins can update sections.");
    };

    let section : Section = { key; content };
    sections.add(key, section);
  };

  public query ({ caller }) func getSection(key : Text) : async ?Section {
    sections.get(key);
  };

  public query ({ caller }) func getAllSections() : async [Section] {
    sections.values().toArray();
  };

  public shared ({ caller }) func initializeDefaultSections() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized Access: Only admins can initialize sections.");
    };

    let defaultSections : [(Text, Text)] = [
      ("willkommen", "Willkommen zu unserer Hochzeit!"),
      ("location", "Die Hochzeit findet auf dem Landgut statt."),
      ("anreise", "Anreiseinformationen findest du hier."),
      ("programm", "Programmablauf des Tages."),
      ("workshops", "Spannende Workshops für alle."),
      ("uebernachtung", "Unterkünfte in der Nähe."),
      ("kleidung", "Dresscode und Tipps zur Kleidung."),
      ("beitraege", "Beiträge und Überraschungen."),
      ("geschenke", "Wunschliste und Geschenke."),
      ("anmeldung", "Melde dich bitte an."),
    ];

    for ((key, content) in defaultSections.values()) {
      let section : Section = { key; content };
      sections.add(key, section);
    };
  };
};
